"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PaymentFormState = { error: string | null };

export async function createManualPayment(
  _prev: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const supabase = await createClient();

  const appointmentId = formData.get("appointment_id") as string;
  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as string;
  const type = formData.get("type") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const discountAmount = formData.get("discount_amount")
    ? Number(formData.get("discount_amount"))
    : null;

  if (!appointmentId || !amount || !method || !type) {
    return { error: "Elegí un turno, un método, un tipo y un monto." };
  }

  const { data: appointment, error: apptError } = await supabase
    .from("appointments")
    .select("client_id")
    .eq("id", appointmentId)
    .single();

  if (apptError || !appointment) {
    return { error: "No se encontró el turno seleccionado." };
  }

  const { data: businessId, error: bizError } = await supabase.rpc("get_my_business_id");
  if (bizError || !businessId) {
    return { error: "No se pudo determinar tu negocio. Volvé a iniciar sesión." };
  }

  // Los pagos manuales (efectivo/transferencia/otro) los carga el staff
  // después de recibir el dinero, así que van directo como "approved" — a
  // diferencia de Mercado Pago, donde el webhook resuelve el estado real.
  const { error } = await supabase.from("payments").insert({
    business_id: businessId,
    appointment_id: appointmentId,
    client_id: appointment.client_id,
    amount,
    type,
    method,
    status: "approved",
    notes,
    discount_amount: discountAmount,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { error: null };
}

export async function updatePaymentStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("payments").update({ status }).eq("id", id);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}
