import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { PaymentsTable, type PaymentRow } from "@/components/payments-table";
import { PaymentDialog, type AppointmentOption } from "@/components/payment-dialog";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export default async function PaymentsAdminPage() {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = startOfMonth();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const since90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: payments }, { data: appointments }] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "id, amount, discount_amount, type, status, method, notes, created_at, client:clients(full_name), appointment:appointments(service:services(name))"
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("appointments")
      .select("id, starts_at, client:clients(full_name), service:services(name)")
      .gte("starts_at", since90Days)
      .lte("starts_at", in90Days)
      .order("starts_at", { ascending: false }),
  ]);

  const rows = (payments as unknown as PaymentRow[]) ?? [];
  const approvedThisMonth = rows.filter((p) => p.status === "approved" && p.created_at >= monthStart);
  const totalByMethod = (method: string) =>
    approvedThisMonth.filter((p) => p.method === method).reduce((sum, p) => sum + Number(p.amount), 0);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0, notation: "compact" }).format(n);

  const appointmentOptions: AppointmentOption[] = (appointments ?? []).map((a) => {
    const appt = a as unknown as {
      id: string;
      starts_at: string;
      client: { full_name: string } | null;
      service: { name: string } | null;
    };
    return {
      id: appt.id,
      starts_at: appt.starts_at,
      client_name: appt.client?.full_name ?? "Sin cliente",
      service_name: appt.service?.name ?? "Sin servicio",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="type-display text-4xl leading-none">Pagos</h1>
        <PaymentDialog appointments={appointmentOptions} trigger={<Button>Cargar pago manual</Button>} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Mercado Pago" value={formatCurrency(totalByMethod("mercadopago"))} caption="este mes, aprobado" accent />
        <KpiCard label="Efectivo" value={formatCurrency(totalByMethod("efectivo"))} caption="este mes" />
        <KpiCard label="Transferencia" value={formatCurrency(totalByMethod("transferencia"))} caption="este mes" />
        <KpiCard label="Otro" value={formatCurrency(totalByMethod("otro"))} caption="este mes" />
      </div>

      <PaymentsTable payments={rows} />
    </div>
  );
}
