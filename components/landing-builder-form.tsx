"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
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

export function LandingBuilderForm({
  config,
  business,
  onSaved,
}: {
  config: LandingConfig;
  business: { name: string; address: string | null; city: string | null };
  onSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateLandingConfig, initialState);
  const [showBenefits, setShowBenefits] = useState(config.sections?.benefits ?? true);
  const [showGallery, setShowGallery] = useState(config.sections?.gallery ?? true);
  const [showReviews, setShowReviews] = useState(config.sections?.reviews ?? true);
  const [showMap, setShowMap] = useState(config.sections?.map ?? true);
  const [heroImageUrl, setHeroImageUrl] = useState(config.hero_image_url ?? "");

  useEffect(() => {
    if (!pending && !state.error && state !== initialState) {
      onSaved?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Identidad</p>
        <p className="text-sm text-muted-foreground">
          Nombre y ubicación del negocio — se usan en toda la landing, el header del admin y el
          mapa. Es el mismo dato en todas partes, no algo aparte del Landing Builder.
        </p>
        <div>
          <Label className="mb-1 block">Nombre del negocio</Label>
          <Input name="business_name" defaultValue={business.name} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block">Dirección</Label>
            <Input name="address" defaultValue={business.address ?? ""} placeholder="Ej: Bailén 102" />
          </div>
          <div>
            <Label className="mb-1 block">Ciudad</Label>
            <Input name="city" defaultValue={business.city ?? ""} placeholder="Ej: San Martín, Mendoza" />
          </div>
        </div>
      </div>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Hero</p>
        <p className="text-sm text-muted-foreground">
          El título ya sale del nombre del negocio (arriba) — acá se agrega el subtítulo, la foto
          de fondo y el texto del botón principal.
        </p>
        <div>
          <Label className="mb-1 block">Subtítulo (opcional)</Label>
          <Input name="hero_subtitle" defaultValue={config.hero_subtitle ?? ""} placeholder="Ej: Turnos de lunes a sábado" />
        </div>
        <div>
          <Label className="mb-1 block">URL de la foto de fondo</Label>
          <Input
            name="hero_image_url"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            placeholder="https://..."
          />
          {heroImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImageUrl}
              alt="Vista previa de la foto de fondo"
              className="mt-2 h-24 w-full rounded-[6px] object-cover"
            />
          )}
        </div>
        <div>
          <Label className="mb-1 block">Texto del botón principal</Label>
          <Input name="cta_label" defaultValue={config.cta_label ?? "Reservar turno"} />
        </div>
      </div>

      <Block
        title="Destacados"
        description="Botones cortos que resaltan info importante debajo del hero (no tienen que ser 'beneficios' — pueden ser lo que quieras). Uno por línea."
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

      <div className="surface space-y-2 bg-card p-5">
        <p className="type-display text-lg leading-none">Servicios</p>
        <p className="text-sm text-muted-foreground">
          La lista que se ve en la landing son los servicios activos — se editan en su propio
          módulo, no acá, para no duplicar el mismo dato en dos lugares.
        </p>
        <Link href="/admin/services" className="kicker-label text-foreground underline">
          Ir a Servicios
        </Link>
      </div>

      <Block
        title="Galería"
        description="Fotos de trabajos realizados. Una URL de imagen por línea (la primera se muestra más grande). Si la dejás vacía, la sección no aparece."
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
        description="Se arma solo a partir de la dirección/ciudad que cargaste en Identidad, arriba."
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
