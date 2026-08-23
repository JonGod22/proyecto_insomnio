"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ServiceFormState = { error: string | null };

export async function upsertService(
  _prev: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const priceOnRequest = formData.get("price_on_request") === "on";

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    description: (formData.get("description") as string)?.trim() || null,
    price_on_request: priceOnRequest,
    price: priceOnRequest ? null : Number(formData.get("price") || 0),
    deposit_amount: formData.get("deposit_amount") ? Number(formData.get("deposit_amount")) : null,
    duration_minutes: Number(formData.get("duration_minutes")),
    duration_minutes_max: formData.get("duration_minutes_max")
      ? Number(formData.get("duration_minutes_max"))
      : null,
    active: formData.get("active") === "on",
  };

  if (!payload.name || !payload.duration_minutes) {
    return { error: "Nombre y duración son obligatorios." };
  }

  if (id) {
    const { error } = await supabase.from("services").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data: businessId, error: bizError } = await supabase.rpc("get_my_business_id");
    if (bizError || !businessId) {
      return { error: "No se pudo determinar tu negocio. Volvé a iniciar sesión." };
    }
    const { error } = await supabase.from("services").insert({ ...payload, business_id: businessId });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/services");
  return { error: null };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin/services");
}
