"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type KnowledgeFormState = { error: string | null };

export async function upsertKnowledgeEntry(
  _prev: KnowledgeFormState,
  formData: FormData
): Promise<KnowledgeFormState> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    return { error: "Título y contenido son obligatorios." };
  }

  if (id) {
    const { error } = await supabase.from("knowledge_base").update({ title, content }).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data: businessId, error: bizError } = await supabase.rpc("get_my_business_id");
    if (bizError || !businessId) {
      return { error: "No se pudo determinar tu negocio. Volvé a iniciar sesión." };
    }
    const { error } = await supabase.from("knowledge_base").insert({ title, content, business_id: businessId });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/knowledge");
  revalidatePath("/admin");
  return { error: null };
}

export async function deleteKnowledgeEntry(id: string) {
  const supabase = await createClient();
  await supabase.from("knowledge_base").delete().eq("id", id);
  revalidatePath("/admin/knowledge");
  revalidatePath("/admin");
}
