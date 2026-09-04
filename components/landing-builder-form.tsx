"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { updateLandingConfig, type LandingFormState } from "@/app/(admin)/admin/landing-builder/actions";
import type { LandingConfig } from "@/lib/types";

const initialState: LandingFormState = { error: null };

function Block({
  title,
  description,
  enabled,
  onToggle,
  toggleName,
  children,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  toggleName: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="surface space-y-3 bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-display text-lg leading-none">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm">
          <input type="hidden" name={toggleName} value={enabled ? "on" : ""} />
          <Checkbox checked={enabled} onCheckedChange={(v) => onToggle(v === true)} />
          Visible
        </label>
      </div>
      {enabled && children}
    </div>
  );
}

export function LandingBuilderForm({ config, onSaved }: { config: LandingConfig; onSaved?: () => void }) {
  const [state, formAction, pending] = useActionState(updateLandingConfig, initialState);
  const [showBenefits, setShowBenefits] = useState(config.sections?.benefits ?? true);
  const [showGallery, setShowGallery] = useState(config.sections?.gallery ?? true);
  const [showReviews, setShowReviews] = useState(config.sections?.reviews ?? true);
  const [showMap, setShowMap] = useState(config.sections?.map ?? true);

  useEffect(() => {
    if (!pending && !state.error && state !== initialState) {
      onSaved?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Hero</p>
        <p className="text-sm text-muted-foreground">
          El título y la descripción del negocio ya salen de sus datos — acá solo se agrega texto
          extra y la foto de fondo.
        </p>
        <div>
          <Label className="mb-1 block">Subtítulo (opcional)</Label>
          <Input name="hero_subtitle" defaultValue={config.hero_subtitle ?? ""} placeholder="Ej: Turnos de lunes a sábado" />
        </div>
        <div>
          <Label className="mb-1 block">URL de la foto de fondo (opcional)</Label>
          <Input
            name="hero_image_url"
            defaultValue={config.hero_image_url ?? ""}
            placeholder="https://..."
          />
        </div>
      </div>

      <Block
        title="Beneficios"
        description="Los chips debajo del hero. Uno por línea."
        enabled={showBenefits}
        onToggle={setShowBenefits}
        toggleName="section_benefits"
      >
        <Textarea
          name="benefits"
          rows={4}
          defaultValue={(config.benefits ?? []).join("\n")}
          placeholder={"Estacionamiento propio\nWifi gratis\nMasaje de cierre"}
        />
      </Block>

      <Block
        title="Reseñas"
        description="Puntaje y cantidad de valoraciones que se muestran junto al botón de reservar."
        enabled={showReviews}
        onToggle={setShowReviews}
        toggleName="section_reviews"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block">Puntaje (0-5)</Label>
            <Input
              name="reviews_rating"
              type="number"
              min={0}
              max={5}
              step="0.1"
              defaultValue={config.reviews?.rating ?? ""}
            />
          </div>
          <div>
            <Label className="mb-1 block">Cantidad de reseñas</Label>
            <Input name="reviews_count" type="number" min={0} defaultValue={config.reviews?.count ?? ""} />
          </div>
        </div>
      </Block>

      <Block
        title="Galería"
        description="Fotos de trabajos realizados. Una URL de imagen por línea (la primera se muestra más grande)."
        enabled={showGallery}
        onToggle={setShowGallery}
        toggleName="section_gallery"
      >
        <Textarea
          name="gallery"
          rows={5}
          defaultValue={(config.gallery ?? []).join("\n")}
          placeholder={"https://...\nhttps://...\nhttps://..."}
        />
      </Block>

      <Block
        title="Mapa"
        description="Mapa embebido con la dirección del negocio (se arma solo a partir de la dirección cargada)."
        enabled={showMap}
        onToggle={setShowMap}
        toggleName="section_map"
      />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="halo">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
      {!pending && !state.error && state !== initialState && (
        <p className="text-sm text-muted-foreground">Guardado. Ya se ve en la landing pública.</p>
      )}
    </form>
  );
}
