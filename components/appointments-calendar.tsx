"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";

export type CalendarAppointment = {
  id: string;
  starts_at: string;
  status: AppointmentStatus;
  client: { full_name: string } | null;
  service: { name: string } | null;
};

const STATUS_DOT: Record<AppointmentStatus, string> = {
  pending: "bg-primary",
  confirmed: "bg-success",
  completed: "bg-foreground",
  cancelled: "bg-destructive",
  no_show: "bg-destructive",
};

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Lunes como primer día de la semana.
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthMatrix(anchor: Date) {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function AppointmentsCalendar({ appointments }: { appointments: CalendarAppointment[] }) {
  const [mode, setMode] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(() => new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    for (const a of appointments) {
      const key = new Date(a.starts_at).toDateString();
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((x, y) => x.starts_at.localeCompare(y.starts_at));
    return map;
  }, [appointments]);

  const days = mode === "month" ? monthMatrix(anchor) : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i));
  const today = new Date();
  const currentMonth = anchor.getMonth();

  function goPrev() {
    setAnchor((d) => (mode === "month" ? new Date(d.getFullYear(), d.getMonth() - 1, 1) : addDays(d, -7)));
  }
  function goNext() {
    setAnchor((d) => (mode === "month" ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : addDays(d, 7)));
  }
  function goToday() {
    setAnchor(new Date());
  }

  const label = mode === "month"
    ? anchor.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    : `Semana del ${startOfWeek(anchor).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}`;

  return (
    <div className="surface bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="type-display text-xl leading-none capitalize">{label}</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["month", "week"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "kicker-label rounded-md px-3 py-1.5 transition-colors",
                  mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {m === "month" ? "Mes" : "Semana"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={goPrev} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Anterior">
              <ChevronLeftIcon className="size-4" />
            </button>
            <button onClick={goToday} className="kicker-label rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted">
              Hoy
            </button>
            <button onClick={goNext} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Siguiente">
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-border">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="kicker-label border-b border-border p-2 text-center text-muted-foreground">
            {label}
          </div>
        ))}

        {days.map((day) => {
          const list = byDay.get(day.toDateString()) ?? [];
          const isToday = isSameDay(day, today);
          const dimmed = mode === "month" && day.getMonth() !== currentMonth;
          const visible = mode === "month" ? list.slice(0, 3) : list;
          const hidden = mode === "month" ? list.length - visible.length : 0;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[6rem] border-b border-r border-border p-1.5 last:border-r-0",
                mode === "week" && "min-h-[16rem]",
                dimmed && "bg-muted/30"
              )}
            >
              <p className={cn("kicker-label mb-1 px-0.5 text-muted-foreground", dimmed && "opacity-50", isToday && "text-primary")}>
                {day.getDate()}
                {mode === "week" && ` ${day.toLocaleDateString("es-AR", { weekday: "short" })}`}
              </p>
              <div className="space-y-1">
                {visible.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-1 truncate rounded-[4px] bg-muted px-1.5 py-0.5 text-xs"
                    title={`${formatTime(a.starts_at)} · ${a.client?.full_name ?? "—"} · ${a.service?.name ?? ""}`}
                  >
                    <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[a.status])} />
                    <span className="truncate tabular-nums">{formatTime(a.starts_at)}</span>
                    <span className="truncate text-muted-foreground">{a.client?.full_name ?? "—"}</span>
                  </div>
                ))}
                {hidden > 0 && (
                  <Badge variant="outline" className="w-full justify-center">
                    +{hidden} más
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
