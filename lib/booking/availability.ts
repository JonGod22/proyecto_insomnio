import type { SupabaseClient } from "@supabase/supabase-js";
import type { AvailableSlot, Database } from "@/lib/types";

type Client = SupabaseClient<Database>;

/**
 * Única fuente de verdad de disponibilidad y reserva. El camino manual
 * (UI, app/(public)/[slug]/booking) y el camino agente (lib/agent/tools)
 * llaman exclusivamente estas dos funciones — nunca hacen SELECT/INSERT
 * directo sobre `appointments`. La atomicidad real (lock + chequeo de
 * conflicto) vive en Postgres, en `create_appointment_atomic`.
 */

export async function getAvailableSlots(
  supabase: Client,
  params: { businessId: string; serviceId: string; date: string }
): Promise<{ slots: AvailableSlot[]; error: string | null }> {
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_business_id: params.businessId,
    p_service_id: params.serviceId,
    p_date: params.date,
  });

  if (error) {
    return { slots: [], error: error.message };
  }

  return { slots: data ?? [], error: null };
}

export type BookAppointmentParams = {
  businessId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  startsAt: string;
  source?: "manual" | "agent";
};

export async function bookAppointment(supabase: Client, params: BookAppointmentParams) {
  const { data, error } = await supabase.rpc("create_appointment_atomic", {
    p_business_id: params.businessId,
    p_service_id: params.serviceId,
    p_client_name: params.clientName,
    p_client_phone: params.clientPhone,
    p_starts_at: params.startsAt,
    p_source: params.source ?? "manual",
  });

  if (error) {
    // 'slot_conflict': otro cliente reservó ese horario antes.
    // El llamador (UI o agente) debe re-consultar get_available_slots.
    return { appointment: null, error: error.message };
  }

  return { appointment: data, error: null };
}
