"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PlatformSettingsFormState = { error: string | null; ok: boolean };

/**
 * Edita la ÚNICA fila de `platform_settings`: la plantilla base compartida
 * por todos los negocios (créditos del pie, copy del agente). No tiene
 * nada que ver con el Landing Builder, que edita el `landing.config_json`
 * de un negocio puntual — esto es el "super-permiso" separado que Jonathan
 * pidió para no tener que tocar código cada vez que cambia algo del molde
 * base. La RLS de `platform_settings` ya exige `is_superadmin()` para
 * updatear, así que esto falla solo si alguien sin ese flag intenta usarlo.
 */
export async function updatePlatformSettings(
  _prev: PlatformSettingsFormState,
  formData: FormData
): Promise<PlatformSettingsFormState> {
  const supabase = await createClient();

  const creditName = (formData.get("credit_name") as string)?.trim() || "Jonathan Godoy";
  const creditGithubUrl = (formData.get("credit_github_url") as string)?.trim() || null;
  const creditInstagramUrl = (formData.get("credit_instagram_url") as string)?.trim() || null;
  const creditWhatsappUrl = (formData.get("credit_whatsapp_url") as string)?.trim() || null;
  const chatGreeting =
    (formData.get("chat_greeting") as string)?.trim() ||
    "Preguntame por precios, disponibilidad o pedí un turno.";
  const chatSuggestions = formData
    .getAll("chat_suggestion")
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, 6);

  const { error } = await supabase
    .from("platform_settings")
    .update({
      credit_name: creditName,
      credit_github_url: creditGithubUrl,
      credit_instagram_url: creditInstagramUrl,
      credit_whatsapp_url: creditWhatsappUrl,
      chat_greeting: chatGreeting,
      chat_suggestions: chatSuggestions.length ? chatSuggestions : ["¿Qué servicios tienen?"],
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message, ok: false };

  // La plantilla base la usan TODAS las landings públicas y el preview del
  // Landing Builder — no tenemos sus slugs acá, pero al no ser rutas
  // estáticas de larga duración se resuelven solas en el próximo request.
  revalidatePath("/superadmin");

  return { error: null, ok: true };
}
