import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentsTable, type PaymentRow } from "@/components/payments-table";
import { PaymentDialog, type AppointmentOption } from "@/components/payment-dialog";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
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
        "id, appointment_id, amount, discount_amount, type, status, method, notes, created_at, client:clients(full_name), appointment:appointments(service:services(name))"
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("appointments")
      .select("id, starts_at, status, client:clients(full_name), service:services(name, price, price_on_request)")
      .neq("status", "cancelled")
      .gte("starts_at", since90Days)
      .lte("starts_at", in90Days)
      .order("starts_at", { ascending: false }),
  ]);

  const rows = (payments as unknown as PaymentRow[]) ?? [];
  const approvedThisMonth = rows.filter((p) => p.status === "approved" && p.created_at >= monthStart);
  const totalByMethod = (method: string) =>
    approvedThisMonth.filter((p) => p.method === method).reduce((sum, p) => sum + Number(p.amount), 0);

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

  // Saldo pendiente por turno: suma de pagos aprobados (menos descuentos)
  // contra el precio del servicio. Responde "qué pasa si falta el resto
  // del pago" — se ve acá en vez de inventar un estado nuevo en payments,
  // porque un turno puede tener varias filas de pago (seña + resto, cada
  // una con su propio método).
  const pendingBalances = (appointments ?? [])
    .map((a) => {
      const appt = a as unknown as {
        id: string;
        starts_at: string;
        client: { full_name: string } | null;
        service: { name: string; price: number | null; price_on_request: boolean } | null;
      };
      if (!appt.service || appt.service.price_on_request || appt.service.price === null) return null;

      const paid = rows
        .filter((p) => p.appointment_id === appt.id && p.status === "approved" && p.type !== "refund")
        .reduce((sum, p) => sum + Number(p.amount) - Number(p.discount_amount ?? 0), 0);

      const balance = Number(appt.service.price) - paid;
      if (balance <= 0) return null;

      return {
        id: appt.id,
        client_name: appt.client?.full_name ?? "Sin cliente",
        service_name: appt.service.name,
        price: Number(appt.service.price),
        paid,
        balance,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

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

      {pendingBalances.length > 0 && (
        <div className="surface bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="type-display text-lg leading-none">Saldo pendiente</p>
            <Badge variant="outline">{pendingBalances.length} turno{pendingBalances.length === 1 ? "" : "s"}</Badge>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Turnos con seña o pago parcial donde todavía falta cobrar el resto.
          </p>
          <div className="space-y-2">
            {pendingBalances.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0 last:pb-0">
                <div>
                  <p>{b.client_name} · {b.service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Pagó {formatCurrency(b.paid)} de {formatCurrency(b.price)}
                  </p>
                </div>
                <Badge>{formatCurrency(b.balance)} pendiente</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <PaymentsTable payments={rows} />
    </div>
  );
}
