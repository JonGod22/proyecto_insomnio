import { createClient } from "@/lib/supabase/server";
import { AppointmentsTable, type AppointmentRow } from "@/components/appointments-table";

export default async function AppointmentsAdminPage() {
  const supabase = await createClient();
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, ends_at, status, source, client:clients(full_name, phone), service:services(name)")
    .gte("starts_at", now.toISOString())
    .lte("starts_at", in90Days)
    .order("starts_at");

  return (
    <div className="space-y-6">
      <h1 className="type-display text-4xl leading-none">Turnos</h1>
      <AppointmentsTable appointments={(appointments as unknown as AppointmentRow[]) ?? []} />
    </div>
  );
}
