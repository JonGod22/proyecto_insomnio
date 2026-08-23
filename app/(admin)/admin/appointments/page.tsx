import { createClient } from "@/lib/supabase/server";
import { AppointmentsTable, type AppointmentRow } from "@/components/appointments-table";

export default async function AppointmentsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, source, client:clients(full_name, phone), service:services(name)"
    )
    .order("starts_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Turnos</h1>
      <AppointmentsTable appointments={(data as unknown as AppointmentRow[]) ?? []} />
    </div>
  );
}
