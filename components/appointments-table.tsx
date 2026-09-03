"use client";

import { Fragment, useMemo, useState } from "react";
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
// arranca en "Acción" en vez de mostrar todos los botones a la vez.
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

type Range = "hoy" | "semana" | "mes";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" });
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

function AppointmentActions({ appointment }: { appointment: AppointmentRow }) {
  const options = ACTIONS[appointment.status];
  if (options.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            Acción
            <ChevronDownIcon className="size-3.5" />
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

function AppointmentDetails({ appointment }: { appointment: AppointmentRow }) {
  return (
    <div className="grid grid-cols-2 gap-3 border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:grid-cols-4">
      <div>
        <p className="kicker-label mb-1">Fecha completa</p>
        <p>{formatDate(appointment.starts_at)}, {formatTime(appointment.starts_at)}–{formatTime(appointment.ends_at)}</p>
      </div>
      <div>
        <p className="kicker-label mb-1">Teléfono</p>
        <p>{appointment.client?.phone ?? "—"}</p>
      </div>
      <div>
        <p className="kicker-label mb-1">Origen</p>
        <p>{appointment.source === "agent" ? "Agente IA" : "Manual"}</p>
      </div>
      <div>
        <p className="kicker-label mb-1">Estado</p>
        <p>{STATUS_LABEL[appointment.status]}</p>
      </div>
    </div>
  );
}

export function AppointmentsTable({ appointments }: { appointments: AppointmentRow[] }) {
  const [range, setRange] = useState<Range>("semana");
  const [expanded, setExpanded] = useState<string | null>(null);
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
            <TableHead className="w-24">Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead className="w-32">Estado</TableHead>
            <TableHead className="w-28 text-right">Acción</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((a) => {
            const isOpen = expanded === a.id;
            return (
              <Fragment key={a.id}>
                <TableRow className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : a.id)}>
                  <TableCell className="tabular-nums">{formatTime(a.starts_at)}</TableCell>
                  <TableCell>{a.client?.full_name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{a.service?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="w-28 justify-start gap-2">
                      <span className={cn("size-2 rounded-full", STATUS_DOT[a.status])} />
                      {STATUS_LABEL[a.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <AppointmentActions appointment={a} />
                  </TableCell>
                  <TableCell>
                    <ChevronDownIcon className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="p-0">
                      <AppointmentDetails appointment={a} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
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
