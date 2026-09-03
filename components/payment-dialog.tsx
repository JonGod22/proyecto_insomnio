"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createManualPayment, type PaymentFormState } from "@/app/(admin)/admin/payments/actions";

export type AppointmentOption = {
  id: string;
  starts_at: string;
  client_name: string;
  service_name: string;
};

const METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia / alias" },
  { value: "otro", label: "Otro" },
];

const TYPES = [
  { value: "deposit", label: "Seña" },
  { value: "full", label: "Pago completo" },
  { value: "refund", label: "Devolución" },
];

const initialState: PaymentFormState = { error: null };

function formatOption(a: AppointmentOption) {
  const date = new Date(a.starts_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
  return `${date} · ${a.client_name} · ${a.service_name}`;
}

export function PaymentDialog({ appointments, trigger }: { appointments: AppointmentOption[]; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createManualPayment, initialState);

  useEffect(() => {
    if (open && !state.error && state !== initialState) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cargar pago manual</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <div>
            <Label className="mb-1 block">Turno</Label>
            <Select name="appointment_id">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí un turno">
                  {(value: string) => {
                    const a = appointments.find((x) => x.id === value);
                    return a ? formatOption(a) : undefined;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {appointments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {formatOption(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block">Método</Label>
              <Select name="method">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Método">
                    {(value: string) => METHODS.find((m) => m.value === value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Tipo</Label>
              <Select name="type">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo">
                    {(value: string) => TYPES.find((t) => t.value === value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block">Monto</Label>
              <Input name="amount" type="number" min={0} step="0.01" required />
            </div>
            <div>
              <Label className="mb-1 block">Descuento (opcional)</Label>
              <Input name="discount_amount" type="number" min={0} step="0.01" />
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Nota (opcional)</Label>
            <Textarea name="notes" rows={2} placeholder="Ej: alias Lemon, transferencia a nombre de..." />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              Guardar pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
