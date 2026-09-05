"use client";

import { useActionState, useEffect, useState } from "react";
import { XIcon, PlusIcon } from "lucide-react";
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

const INFO_IMAGES_MAX = 3;

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
  const [infoImages, setInfoImages] = useState<string[]>(service?.info_images ?? []);
  const [newInfoImage, setNewInfoImage] = useState("");
  const [state, formAction, pending] = useActionState(upsertService, initialState);

  function addInfoImage() {
    const url = newInfoImage.trim();
    if (!url || infoImages.length >= INFO_IMAGES_MAX) return;
    setInfoImages((prev) => [...prev, url]);
    setNewInfoImage("");
  }

  function removeInfoImage(index: number) {
    setInfoImages((prev) => prev.filter((_, i) => i !== index));
  }

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

          <div className="space-y-1 border-t border-border pt-3">
            <Label className="block">Información del servicio (para la landing)</Label>
            <p className="text-xs text-muted-foreground">
              Se muestra en un popup &quot;Más información&quot; en la tarjeta del servicio.
            </p>
            <Textarea name="info_content" defaultValue={service?.info_content ?? ""} rows={4} required />
          </div>

          <div className="space-y-2">
            <Label className="block">Fotos del servicio (opcional, hasta {INFO_IMAGES_MAX})</Label>
            {infoImages.map((url, i) => (
              <div key={`${url}-${i}`} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-10 shrink-0 rounded-[4px] object-cover" />
                <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{url}</p>
                <button
                  type="button"
                  onClick={() => removeInfoImage(i)}
                  aria-label="Quitar imagen"
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <XIcon className="size-4" />
                </button>
                <input type="hidden" name="info_image" value={url} />
              </div>
            ))}
            {infoImages.length < INFO_IMAGES_MAX && (
              <div className="flex gap-2">
                <Input
                  value={newInfoImage}
                  onChange={(e) => setNewInfoImage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInfoImage();
                    }
                  }}
                  placeholder="https://..."
                />
                <Button type="button" variant="outline" size="icon" onClick={addInfoImage} aria-label="Agregar imagen">
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            )}
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
