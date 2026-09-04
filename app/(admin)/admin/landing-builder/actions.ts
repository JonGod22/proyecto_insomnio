"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LandingConfig } from "@/lib/types";

export type LandingFormState = { error: string | null };

// Si alguien pega el <iframe ...> completo en vez de solo la URL, se
// extrae el src en vez de guardar HTML roto.
function extractMapUrl(raw: string) {
  const match = raw.match(/src=["']([^"']+)["']/);
  return (match ? match[1] : raw).trim();
}

export async function updateLandingConfig(
  _prev: LandingFormState,
  formData: FormData
): Promise<LandingFormState> {
  const supabase = await createClient();

  const { data: businessId, error: bizError } = await supabase.rpc("get_my_business_id");
  if (bizError || !businessId) {
    return { error: "No se pudo determinar tu negocio. Volvé a iniciar sesión." };
  }

  const heroTitle = (formData.get("hero_title") as string)?.trim() || undefined;
  const locationLabel = (formData.get("location_label") as string)?.trim() || undefined;
  const heroSubtitle = (formData.get("hero_subtitle") as string)?.trim() || undefined;
  const heroImageUrl = (formData.get("hero_image_url") as string)?.trim() || undefined;
  const ctaLabel = (formData.get("cta_label") as string)?.trim() || undefined;
  const instagramUrl = (formData.get("instagram_url") as string)?.trim() || undefined;
  const mapEmbedUrlRaw = (formData.get("map_embed_url") as string)?.trim();
  const mapEmbedUrl = mapEmbedUrlRaw ? extractMapUrl(mapEmbedUrlRaw) : undefined;
  const benefits = String(formData.get("benefits") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const gallery = formData
    .getAll("gallery_url")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const config: LandingConfig = {
    hero_title: heroTitle,
    location_label: locationLabel,
    hero_subtitle: heroSubtitle,
    hero_image_url: heroImageUrl,
    cta_label: ctaLabel,
    map_embed_url: mapEmbedUrl,
    instagram_url: instagramUrl,
    benefits: benefits.length ? benefits : undefined,
    gallery: gallery.length ? gallery : undefined,
    sections: {
      benefits: formData.get("section_benefits") === "on",
      gallery: formData.get("section_gallery") === "on",
      map: formData.get("section_map") === "on",
    },
  };

  const { error } = await supabase
    .from("landing")
    .upsert({ business_id: businessId, config_json: config }, { onConflict: "business_id" });

  if (error) return { error: error.message };

  // WhatsApp es un dato de contacto real del negocio (no editorial), vive
  // en businesses — pero a diferencia del nombre, no alimenta ningún otro
  // "símbolo" del sistema, así que no hay problema en editarlo desde acá.
  const whatsapp = (formData.get("whatsapp_number") as string)?.trim() || null;
  const { error: waError } = await supabase.from("businesses").update({ whatsapp_number: whatsapp }).eq("id", businessId);
  if (waError) return { error: waError.message };

  revalidatePath("/admin/landing-builder");
  revalidatePath("/admin");
  // La landing pública usa el slug, no lo tenemos acá directo — revalidatePath
  // con layout "page" no aplica; se resuelve al pedir la página de nuevo
  // porque es una ruta dinámica server-rendered (sin caché estática larga).

  return { error: null };
}
