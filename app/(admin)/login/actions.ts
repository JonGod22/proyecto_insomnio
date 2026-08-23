"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error: string | null; message?: string };

export async function signIn(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) return { error: error.message };
  redirect("/admin/appointments");
}

export async function signUp(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) return { error: error.message };
  return {
    error: null,
    message:
      "Cuenta creada. Si pide confirmación por correo, revisá tu bandeja. Todavía falta vincular tu cuenta a un negocio antes de poder usar el panel.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
