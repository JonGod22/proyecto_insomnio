"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateAppointmentStatus } from "@/app/(admin)/admin/appointments/actions";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";

export type AppointmentRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  source: string;
  client: { full_name: string; phone: string } | null;
  service: { name: string } | null;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
  no_show: "No asistió",
};

const STATUS_VARIANT: Record<AppointmentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  cancelled: "destructive",
  completed: "secondary",
  no_show: "destructive",
};

type Range = "hoy" | "semana" | "mes";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function inRange(iso: string, range: Range) {
  const date = new Date(iso);
  const now = new Date();
  if (range === "hoy") {
    return date.toDateString() === now.toDateString();
  }
  if (range === "semana") {
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);
    return date >= now && date <= in7Days;
  }
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);
  return date >= now && date <= in30Days;
}

export function AppointmentsTable({ appointments }: { appointments: AppointmentRow[] }) {
  const [range, setRange] = useState<Range>("semana");
  const filtered = useMemo(() => appointments.filter((a) => inRange(a.starts_at, range)), [appointments, range]);

  return (
    <div className="surface bg-card">
      <div className="flex items-center justify-between p-4">
        <p className="type-display text-xl leading-none">Próximos turnos</p>
        <div className="flex gap-1">
          {(["hoy", "semana", "mes"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "kicker-label rounded-md px-3 py-1.5 transition-colors",
                range === r ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {r === "hoy" ? "Hoy" : r === "semana" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{formatDateTime(a.starts_at)}</TableCell>
              <TableCell>
                <p>{a.client?.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{a.client?.phone}</p>
              </TableCell>
              <TableCell>{a.service?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={a.source === "agent" ? "default" : "outline"}>
                  {a.source === "agent" ? "Agente IA" : "Manual"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {a.status === "pending" && (
                  <>
                    <form action={updateAppointmentStatus.bind(null, a.id, "confirmed")}>
                      <Button size="sm" type="submit">
                        Confirmar
                      </Button>
                    </form>
                    <form action={updateAppointmentStatus.bind(null, a.id, "cancelled")}>
                      <Button size="sm" variant="outline" type="submit">
                        Cancelar
                      </Button>
                    </form>
                  </>
                )}
                {a.status === "confirmed" && (
                  <>
                    <form action={updateAppointmentStatus.bind(null, a.id, "completed")}>
                      <Button size="sm" type="submit">
                        Completado
                      </Button>
                    </form>
                    <form action={updateAppointmentStatus.bind(null, a.id, "no_show")}>
                      <Button size="sm" variant="outline" type="submit">
                        No asistió
                      </Button>
                    </form>
                    <form action={updateAppointmentStatus.bind(null, a.id, "cancelled")}>
                      <Button size="sm" variant="destructive" type="submit">
                        Cancelar
                      </Button>
                    </form>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No hay turnos en este rango.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
