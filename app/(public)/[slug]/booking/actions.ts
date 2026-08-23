"use server";

import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots, bookAppointment } from "@/lib/booking/availability";

/**
 * Camino manual: llama exactamente a las mismas funciones que usa el
 * agente (lib/booking/availability.ts) contra la misma base atómica en
 * Postgres. Nunca duplica lógica de disponibilidad ni de booking.
 */
export async function fetchAvailableSlots(businessId: string, serviceId: string, date: string) {
  const supabase = await createClient();
  return getAvailableSlots(supabase, { businessId, serviceId, date });
}

export async function submitBooking(params: {
  businessId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  startsAt: string;
}) {
  const supabase = await createClient();
  return bookAppointment(supabase, { ...params, source: "manual" });
}
