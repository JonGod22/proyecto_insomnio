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
import { Checkbox } from "@/components/ui/checkbox";
import { upsertService, type ServiceFormState } from "@/app/(admin)/admin/services/actions";
import type { Service } from "@/lib/types";

const initialState: ServiceFormState = { error: null };

export function ServiceDialog({
  service,
  trigger,
}: {
  service?: Service;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [priceOnRequest, setPriceOnRequest] = useState(service?.price_on_request ?? false);
  const [active, setActive] = useState(service?.active ?? true);
  const [state, formAction, pending] = useActionState(upsertService, initialState);

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
          <DialogTitle>{service ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          {service && <input type="hidden" name="id" value={service.id} />}
          <input type="hidden" name="price_on_request" value={priceOnRequest ? "on" : ""} />
          <input type="hidden" name="active" value={active ? "on" : ""} />

          <div>
            <Label className="mb-1 block">Nombre</Label>
            <Input name="name" defaultValue={service?.name} required />
          </div>

          <div>
            <Label className="mb-1 block">Descripción</Label>
            <Textarea name="description" defaultValue={service?.description ?? ""} rows={2} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={priceOnRequest} onCheckedChange={(v) => setPriceOnRequest(v === true)} />
            Precio a consultar
          </label>

          {!priceOnRequest && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Precio</Label>
                <Input name="price" type="number" min={0} defaultValue={service?.price ?? ""} />
              </div>
              <div>
                <Label className="mb-1 block">Seña</Label>
                <Input
                  name="deposit_amount"
                  type="number"
                  min={0}
                  defaultValue={service?.deposit_amount ?? ""}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block">Duración (min)</Label>
              <Input
                name="duration_minutes"
                type="number"
                min={1}
                defaultValue={service?.duration_minutes}
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Duración máx. (opcional)</Label>
              <Input
                name="duration_minutes_max"
                type="number"
                min={1}
                defaultValue={service?.duration_minutes_max ?? ""}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={active} onCheckedChange={(v) => setActive(v === true)} />
            Activo (visible en la landing)
          </label>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
