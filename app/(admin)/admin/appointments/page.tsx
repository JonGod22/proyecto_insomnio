import { createClient } from "@/lib/supabase/server";
import { AppointmentsTable, type AppointmentRow } from "@/components/appointments-table";
import { paidForAppointment, priceForBalance } from "@/lib/payments";

export default async function AppointmentsAdminPage() {
  const supabase = await createClient();
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, source, client:clients(full_name, phone), service:services(name, price, price_on_request)"
    )
    .gte("starts_at", now.toISOString())
    .lte("starts_at", in90Days)
    .order("starts_at");

  const ids = (appointments ?? []).map((a) => a.id);
  const { data: payments } = ids.length
    ? await supabase
        .from("payments")
        .select("appointment_id, status, type, amount, discount_amount")
        .in("appointment_id", ids)
    : { data: [] };

  const rows: AppointmentRow[] = (appointments ?? []).map((a) => {
    const appt = a as unknown as {
      id: string;
      starts_at: string;
      ends_at: string;
      status: AppointmentRow["status"];
      source: string;
      client: { full_name: string; phone: string } | null;
      service: { name: string; price: number | null; price_on_request: boolean } | null;
    };
    return {
      id: appt.id,
      starts_at: appt.starts_at,
      ends_at: appt.ends_at,
      status: appt.status,
      source: appt.source,
      client: appt.client,
      service: appt.service ? { name: appt.service.name } : null,
      price: priceForBalance(appt.service),
      paid: paidForAppointment(payments ?? [], appt.id),
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="type-display text-4xl leading-none">Turnos</h1>
      <AppointmentsTable appointments={rows} />
    </div>
  );
}
