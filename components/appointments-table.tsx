"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateAppointmentStatus } from "@/app/(admin)/admin/appointments/actions";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";
import { ChevronDownIcon } from "lucide-react";

export type AppointmentRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  source: string;
  client: { full_name: string; phone: string } | null;
  service: { name: string } | null;
  /** Pagado hasta ahora (aprobado, neto de descuento) contra el precio del
   * servicio — null si el servicio es a consultar / no tiene precio. */
  paid: number;
  price: number | null;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
  no_show: "No asistió",
};

// Mismo ancho para todos los estados — solo cambia el color, para que la
// fila no "salte" de tamaño al cambiar de estado.
const STATUS_DOT: Record<AppointmentStatus, string> = {
  pending: "bg-primary",
  confirmed: "bg-success",
  completed: "bg-foreground",
  cancelled: "bg-destructive",
  no_show: "bg-destructive",
};

// Próxima acción disponible según el estado actual — el menú siempre
// arranca en "Acción" en vez de mostrar todos los botones a la vez. El
// pase a "confirmado" es siempre una decisión manual del staff, nunca
// automática por un pago (aunque haya cobrado el 100% por adelantado).
const ACTIONS: Record<AppointmentStatus, { label: string; next: AppointmentStatus }[]> = {
  pending: [
    { label: "Confirmar", next: "confirmed" },
    { label: "Cancelar", next: "cancelled" },
  ],
  confirmed: [
    { label: "Marcar completado", next: "completed" },
    { label: "No asistió", next: "no_show" },
    { label: "Cancelar", next: "cancelled" },
  ],
  completed: [],
  cancelled: [],
  no_show: [],
};

type Range = "hoy" | "manana";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function inRange(iso: string, range: Range) {
  const date = new Date(iso);
  const now = new Date();
  if (range === "hoy") {
    return date.toDateString() === now.toDateString();
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

function PaymentBadge({ appointment }: { appointment: AppointmentRow }) {
  if (appointment.price === null) return <span className="text-xs text-muted-foreground">—</span>;

  const balance = appointment.price - appointment.paid;
  if (appointment.paid <= 0) {
    return <Badge variant="destructive">Sin pago</Badge>;
  }
  if (balance <= 0) {
    return <Badge>Pagado</Badge>;
  }
  return <Badge variant="outline">Falta {formatCurrency(balance)}</Badge>;
}

function AppointmentActions({ appointment }: { appointment: AppointmentRow }) {
  const options = ACTIONS[appointment.status];
  if (options.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
            Acción
            <ChevronDownIcon className="size-3" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.next}
            onClick={() => updateAppointmentStatus(appointment.id, opt.next)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppointmentsTable({ appointments }: { appointments: AppointmentRow[] }) {
  const [range, setRange] = useState<Range>("hoy");
  const filtered = useMemo(() => appointments.filter((a) => inRange(a.starts_at, range)), [appointments, range]);

  return (
    <div className="surface bg-card">
      <div className="flex items-center justify-between p-3">
        <p className="type-display text-lg leading-none">Turnos en detalle</p>
        <div className="flex gap-1">
          {(["hoy", "manana"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "kicker-label rounded-md px-2.5 py-1 transition-colors",
                range === r ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {r === "hoy" ? "Hoy" : "Mañana"}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-8 w-14 text-xs">Hora</TableHead>
            <TableHead className="h-8 text-xs">Cliente</TableHead>
            <TableHead className="h-8 text-xs">Servicio</TableHead>
            <TableHead className="h-8 w-28 text-xs">Estado</TableHead>
            <TableHead className="h-8 w-28 text-xs">Pago</TableHead>
            <TableHead className="h-8 w-24 text-right text-xs">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="p-1.5 tabular-nums text-sm">{formatTime(a.starts_at)}</TableCell>
              <TableCell className="p-1.5 text-sm leading-tight">
                <p>{a.client?.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{a.client?.phone}</p>
              </TableCell>
              <TableCell className="p-1.5 text-sm">{a.service?.name ?? "—"}</TableCell>
              <TableCell className="p-1.5">
                <Badge variant="outline" className="w-24 justify-start gap-1.5">
                  <span className={cn("size-1.5 rounded-full", STATUS_DOT[a.status])} />
                  {STATUS_LABEL[a.status]}
                </Badge>
              </TableCell>
              <TableCell className="p-1.5">
                <PaymentBadge appointment={a} />
              </TableCell>
              <TableCell className="p-1.5 text-right">
                <AppointmentActions appointment={a} />
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="p-3 text-center text-muted-foreground">
                No hay turnos en este rango.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
