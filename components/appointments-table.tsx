"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateAppointmentStatus } from "@/app/(admin)/admin/appointments/actions";
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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppointmentsTable({ appointments }: { appointments: AppointmentRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Servicio</TableHead>
          <TableHead>Origen</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((a) => (
          <TableRow key={a.id}>
            <TableCell>{formatDateTime(a.starts_at)}</TableCell>
            <TableCell>
              <p>{a.client?.full_name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{a.client?.phone}</p>
            </TableCell>
            <TableCell>{a.service?.name ?? "—"}</TableCell>
            <TableCell className="capitalize">{a.source === "agent" ? "Agente IA" : "Manual"}</TableCell>
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
        {appointments.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No hay turnos todavía.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
