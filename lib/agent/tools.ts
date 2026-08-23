import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";
import type { Database } from "@/lib/types";
import { getAvailableSlots, bookAppointment } from "@/lib/booking/availability";

type Client = SupabaseClient<Database>;

export type ToolContext = {
  supabase: Client;
  businessId: string;
};

/**
 * Function calling cerrado (ver decisión de arquitectura #4): el agente
 * nunca escribe SQL ni inventa datos. Cada tool es una fachada delgada
 * sobre el mismo camino que usa la UI manual — get_available_slots y
 * create_booking llaman literalmente a lib/booking/availability.ts.
 */
export const agentTools: Anthropic.Tool[] = [
  {
    name: "get_services",
    description:
      "Devuelve los servicios activos del negocio con precio, seña y duración. Única fuente válida de precios: nunca inventes ni recuerdes precios de turnos anteriores de la conversación.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_available_slots",
    description:
      "Devuelve los horarios realmente libres para un servicio en una fecha. Única fuente válida de horarios: nunca ofrezcas un horario que no haya salido de esta tool en este turno.",
    input_schema: {
      type: "object",
      properties: {
        service_id: { type: "string", description: "id del servicio (viene de get_services)" },
        date: { type: "string", description: "fecha en formato YYYY-MM-DD" },
      },
      required: ["service_id", "date"],
    },
  },
  {
    name: "create_booking",
    description:
      "Confirma una reserva. Requiere haber ofrecido el horario vía get_available_slots antes. Si el resultado trae error 'slot_conflict', el horario se ocupó justo antes: no confirmes nada al cliente, volvé a llamar get_available_slots y ofrecé alternativas nuevas.",
    input_schema: {
      type: "object",
      properties: {
        service_id: { type: "string" },
        client_name: { type: "string" },
        client_phone: { type: "string" },
        starts_at: {
          type: "string",
          description: "Horario elegido en ISO 8601 con offset de zona horaria, tal cual vino de get_available_slots",
        },
      },
      required: ["service_id", "client_name", "client_phone", "starts_at"],
    },
  },
  {
    name: "search_knowledge_base",
    description:
      "Busca políticas, FAQs, cuidados y tono de marca del negocio (contenido NO transaccional). Nunca la uses para precio, duración o disponibilidad: eso sale siempre de get_services / get_available_slots.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
];

export async function executeTool(
  ctx: ToolContext,
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "get_services": {
      const { data, error } = await ctx.supabase
        .from("services")
        .select(
          "id, name, description, price, price_on_request, deposit_amount, duration_minutes, duration_minutes_max"
        )
        .eq("business_id", ctx.businessId)
        .eq("active", true);
      if (error) return { error: error.message };
      return { services: data };
    }

    case "get_available_slots": {
      const { slots, error } = await getAvailableSlots(ctx.supabase, {
        businessId: ctx.businessId,
        serviceId: String(input.service_id),
        date: String(input.date),
      });
      if (error) return { error };
      return { slots };
    }

    case "create_booking": {
      const { appointment, error } = await bookAppointment(ctx.supabase, {
        businessId: ctx.businessId,
        serviceId: String(input.service_id),
        clientName: String(input.client_name),
        clientPhone: String(input.client_phone),
        startsAt: String(input.starts_at),
        source: "agent",
      });
      if (error) return { error };
      return { appointment };
    }

    case "search_knowledge_base": {
      // TODO(RAG real): reemplazar por embedding (OpenAI text-embedding-3-small,
      // 1536 dims para calzar con knowledge_base.embedding) + supabase.rpc con
      // una función match_knowledge_base basada en <=> (cosine distance).
      // Placeholder mientras no hay pipeline de embeddings: búsqueda por texto.
      const { data, error } = await ctx.supabase
        .from("knowledge_base")
        .select("title, content")
        .eq("business_id", ctx.businessId)
        .ilike("content", `%${String(input.query)}%`)
        .limit(3);
      if (error) return { error: error.message };
      return { results: data };
    }

    default:
      return { error: `unknown_tool:${name}` };
  }
}
