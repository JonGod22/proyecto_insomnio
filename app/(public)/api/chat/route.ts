import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAgent, type ChatMessage } from "@/lib/agent/engine";

/**
 * Excepción documentada (decisión de arquitectura #3): este endpoint es
 * público (landing sin login) por lo que no hay JWT de usuario. Usa
 * service_role server-side e inyecta business_id resuelto desde el
 * `slug` que manda el cliente. La service_role key nunca se expone acá:
 * vive solo en el entorno del servidor (SUPABASE_SERVICE_ROLE_KEY).
 */
export async function POST(req: Request) {
  const body = await req.json();
  const slug = String(body.slug ?? "");
  const messages = (body.messages ?? []) as ChatMessage[];

  if (!slug || messages.length === 0) {
    return NextResponse.json({ error: "missing_slug_or_messages" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name, description")
    .eq("slug", slug)
    .single();

  if (error || !business) {
    return NextResponse.json({ error: "business_not_found" }, { status: 404 });
  }

  const reply = await runAgent(
    { supabase, businessId: business.id },
    { name: business.name, description: business.description },
    messages
  );

  return NextResponse.json({ reply });
}
