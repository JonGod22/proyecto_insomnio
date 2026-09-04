"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LandingConfig } from "@/lib/types";

export type LandingFormState = { error: string | null };

function linesToList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
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

  // Identidad (nombre, dirección, ciudad) vive en businesses, no en el
  // config_json de landing — es el mismo dato que usa el resto del admin
  // y la reserva, así que se edita en la tabla real.
  const businessName = (formData.get("business_name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;

  if (!businessName) {
    return { error: "El nombre del negocio es obligatorio." };
  }

  const { error: bizUpdateError } = await supabase
    .from("businesses")
    .update({ name: businessName, address, city })
    .eq("id", businessId);

  if (bizUpdateError) return { error: bizUpdateError.message };

  const heroSubtitle = (formData.get("hero_subtitle") as string)?.trim() || undefined;
  const heroImageUrl = (formData.get("hero_image_url") as string)?.trim() || undefined;
  const ctaLabel = (formData.get("cta_label") as string)?.trim() || undefined;
  const benefits = linesToList(formData.get("benefits"));
  const gallery = linesToList(formData.get("gallery"));
  const reviewsRating = formData.get("reviews_rating") ? Number(formData.get("reviews_rating")) : null;
  const reviewsCount = formData.get("reviews_count") ? Number(formData.get("reviews_count")) : null;

  const config: LandingConfig = {
    hero_subtitle: heroSubtitle,
    hero_image_url: heroImageUrl,
    cta_label: ctaLabel,
    benefits: benefits.length ? benefits : undefined,
    gallery: gallery.length ? gallery : undefined,
    reviews: reviewsRating && reviewsCount ? { rating: reviewsRating, count: reviewsCount } : undefined,
    sections: {
      benefits: formData.get("section_benefits") === "on",
      gallery: formData.get("section_gallery") === "on",
      reviews: formData.get("section_reviews") === "on",
      map: formData.get("section_map") === "on",
    },
  };

  const { error } = await supabase
    .from("landing")
    .upsert({ business_id: businessId, config_json: config }, { onConflict: "business_id" });

  if (error) return { error: error.message };

  revalidatePath("/admin/landing-builder");
  revalidatePath("/admin");
  // La landing pública usa el slug, no lo tenemos acá directo — revalidatePath
  // con layout "page" no aplica; se resuelve al pedir la página de nuevo
  // porque es una ruta dinámica server-rendered (sin caché estática larga).

  return { error: null };
}
