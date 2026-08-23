"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAvailableSlots, submitBooking } from "@/app/(public)/[slug]/booking/actions";
import type { AvailableSlot } from "@/lib/types";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
};

export function BookingForm({
  businessId,
  services,
  initialServiceId,
}: {
  businessId: string;
  services: Service[];
  initialServiceId?: string;
}) {
  const preselected = services.find((s) => s.id === initialServiceId)?.id;
  const [serviceId, setServiceId] = useState(preselected ?? services[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "confirmed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadSlots() {
    if (!serviceId || !date) return;
    setSelectedSlot(null);
    setStatus("loading");
    const { slots, error } = await fetchAvailableSlots(businessId, serviceId, date);
    setSlots(slots);
    setStatus("idle");
    setErrorMessage(error);
  }

  async function confirm() {
    if (!serviceId || !selectedSlot || !clientName || !clientPhone) return;
    setStatus("loading");
    const { appointment, error } = await submitBooking({
      businessId,
      serviceId,
      clientName,
      clientPhone,
      startsAt: selectedSlot,
    });

    if (error || !appointment) {
      // slot_conflict: alguien reservó ese horario antes. Recargamos
      // disponibilidad real en vez de asumir que sigue libre.
      setErrorMessage(error === "slot_conflict" ? "Ese horario se acaba de ocupar, elegí otro." : error);
      setStatus("error");
      await loadSlots();
      return;
    }

    setStatus("confirmed");
  }

  if (status === "confirmed") {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="type-display text-2xl">¡Turno reservado!</p>
          <p className="mt-2 text-sm text-muted-foreground">Te esperamos. Cualquier cambio, contactanos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-1 block">Servicio</Label>
          <Select value={serviceId} onValueChange={(value) => setServiceId(value ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegí un servicio">
                {(value: string) => services.find((s) => s.id === value)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block">Fecha</Label>
          <div className="flex gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button variant="secondary" onClick={loadSlots} disabled={!serviceId || !date}>
              Ver horarios
            </Button>
          </div>
        </div>

        {slots.length > 0 && (
          <div>
            <Label className="mb-1 block">Horarios disponibles</Label>
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <Button
                  key={slot.slot_start}
                  variant={selectedSlot === slot.slot_start ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSlot(slot.slot_start)}
                >
                  {new Date(slot.slot_start).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Button>
              ))}
            </div>
          </div>
        )}

        {slots.length === 0 && date && status === "idle" && (
          <p className="text-sm text-muted-foreground">No hay horarios para esa fecha.</p>
        )}

        {selectedSlot && (
          <div className="space-y-3 border-t-2 border-foreground pt-4">
            <div>
              <Label className="mb-1 block">Nombre</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Teléfono</Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
            </div>
            <Button
              className="halo w-full"
              onClick={confirm}
              disabled={status === "loading" || !clientName || !clientPhone}
            >
              Confirmar reserva
            </Button>
          </div>
        )}

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      </CardContent>
    </Card>
  );
}
