"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type PaymentRow = {
  id: string;
  amount: number;
  discount_amount: number | null;
  type: string;
  status: string;
  method: string;
  notes: string | null;
  created_at: string;
  client: { full_name: string } | null;
  appointment: { service: { name: string } | null } | null;
};

const METHOD_LABEL: Record<string, string> = {
  mercadopago: "Mercado Pago",
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  otro: "Otro",
};

const TYPE_LABEL: Record<string, string> = {
  deposit: "Seña",
  full: "Completo",
  refund: "Devolución",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  refunded: "Devuelto",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  refunded: "secondary",
};

function formatAmount(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function PaymentsTable({ payments }: { payments: PaymentRow[] }) {
  return (
    <div className="surface bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Nota</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{formatDate(p.created_at)}</TableCell>
              <TableCell>{p.client?.full_name ?? "—"}</TableCell>
              <TableCell>{p.appointment?.service?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="outline">{METHOD_LABEL[p.method] ?? p.method}</Badge>
              </TableCell>
              <TableCell>{TYPE_LABEL[p.type] ?? p.type}</TableCell>
              <TableCell>
                {formatAmount(p.amount)}
                {p.discount_amount ? (
                  <span className="ml-1 text-xs text-muted-foreground">(-{formatAmount(p.discount_amount)})</span>
                ) : null}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{p.notes ?? "—"}</TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Todavía no hay pagos cargados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
