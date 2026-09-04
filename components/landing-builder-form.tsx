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
import type { PreviewBusiness } from "@/components/landing-preview";

const initialState: LandingFormState = { error: null };

function linesToList(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function Block({
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
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
  onLiveChange,
}: {
  config: LandingConfig;
  business: PreviewBusiness & { address: string | null; city: string | null };
  onSaved?: () => void;
  onLiveChange?: (config: LandingConfig, business: PreviewBusiness & { address: string | null; city: string | null }) => void;
}) {
  const [state, formAction, pending] = useActionState(updateLandingConfig, initialState);

  const [businessName, setBusinessName] = useState(business.name);
  const [address, setAddress] = useState(business.address ?? "");
  const [city, setCity] = useState(business.city ?? "");

  const [heroSubtitle, setHeroSubtitle] = useState(config.hero_subtitle ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(config.hero_image_url ?? "");
  const [ctaLabel, setCtaLabel] = useState(config.cta_label ?? "Reservar turno");

  const [showBenefits, setShowBenefits] = useState(config.sections?.benefits ?? true);
  const [benefitsText, setBenefitsText] = useState((config.benefits ?? []).join("\n"));

  const [showReviews, setShowReviews] = useState(config.sections?.reviews ?? true);
  const [reviewsRating, setReviewsRating] = useState(config.reviews?.rating?.toString() ?? "");
  const [reviewsCount, setReviewsCount] = useState(config.reviews?.count?.toString() ?? "");

  const [showGallery, setShowGallery] = useState(config.sections?.gallery ?? true);
  const [galleryText, setGalleryText] = useState((config.gallery ?? []).join("\n"));

  const [showMap, setShowMap] = useState(config.sections?.map ?? true);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(config.map_embed_url ?? "");

  // Cada cambio (todavía sin guardar) se manda al padre para que la vista
  // previa se actualice al instante — nada de esperar al submit.
  useEffect(() => {
    const rating = Number(reviewsRating);
    const count = Number(reviewsCount);
    onLiveChange?.(
      {
        hero_subtitle: heroSubtitle || undefined,
        hero_image_url: heroImageUrl || undefined,
        cta_label: ctaLabel || undefined,
        map_embed_url: mapEmbedUrl || undefined,
        benefits: linesToList(benefitsText),
        gallery: linesToList(galleryText),
        reviews: rating && count ? { rating, count } : undefined,
        sections: { benefits: showBenefits, gallery: showGallery, reviews: showReviews, map: showMap },
      },
      { name: businessName, description: null, address: address || null, city: city || null }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    businessName,
    address,
    city,
    heroSubtitle,
    heroImageUrl,
    ctaLabel,
    mapEmbedUrl,
    showBenefits,
    benefitsText,
    showReviews,
    reviewsRating,
    reviewsCount,
    showGallery,
    galleryText,
    showMap,
  ]);

  useEffect(() => {
    if (!pending && !state.error && state !== initialState) {
      onSaved?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="section_benefits" value={showBenefits ? "on" : ""} />
      <input type="hidden" name="section_reviews" value={showReviews ? "on" : ""} />
      <input type="hidden" name="section_gallery" value={showGallery ? "on" : ""} />
      <input type="hidden" name="section_map" value={showMap ? "on" : ""} />

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Identidad</p>
        <p className="text-sm text-muted-foreground">
          Nombre y ubicación del negocio — se usan en toda la landing, el header del admin y el mapa.
        </p>
        <div>
          <Label className="mb-1 block">Nombre del negocio</Label>
          <Input name="business_name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block">Dirección</Label>
            <Input name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Bailén 102" />
          </div>
          <div>
            <Label className="mb-1 block">Ciudad</Label>
            <Input name="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: San Martín, Mendoza" />
          </div>
        </div>
      </div>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Hero</p>
        <p className="text-sm text-muted-foreground">
          El título ya sale del nombre del negocio (arriba) — acá se agrega el subtítulo, la foto de
          fondo y el texto del botón principal.
        </p>
        <div>
          <Label className="mb-1 block">Subtítulo (opcional)</Label>
          <Input name="hero_subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Ej: Turnos de lunes a sábado" />
        </div>
        <div>
          <Label className="mb-1 block">URL de la foto de fondo</Label>
          <Input name="hero_image_url" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://..." />
          {heroImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImageUrl} alt="Vista previa de la foto de fondo" className="mt-2 h-24 w-full rounded-[6px] object-cover" />
          )}
        </div>
        <div>
          <Label className="mb-1 block">Texto del botón principal</Label>
          <Input name="cta_label" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
        </div>
      </div>

      <Block title="Destacados" description="Botones cortos debajo del hero, uno por línea. No tienen que ser 'beneficios' — pueden ser lo que quieras." enabled={showBenefits} onToggle={setShowBenefits}>
        <Textarea
          name="benefits"
          rows={4}
          value={benefitsText}
          onChange={(e) => setBenefitsText(e.target.value)}
          placeholder={"Estacionamiento propio\nWifi gratis\nMasaje de cierre"}
        />
      </Block>

      <Block title="Reseñas" description="Puntaje y cantidad de valoraciones que se muestran junto al botón de reservar." enabled={showReviews} onToggle={setShowReviews}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block">Puntaje (0-5)</Label>
            <Input name="reviews_rating" type="number" min={0} max={5} step="0.1" value={reviewsRating} onChange={(e) => setReviewsRating(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">Cantidad de reseñas</Label>
            <Input name="reviews_count" type="number" min={0} value={reviewsCount} onChange={(e) => setReviewsCount(e.target.value)} />
          </div>
        </div>
      </Block>

      <div className="surface space-y-2 bg-card p-5">
        <p className="type-display text-lg leading-none">Servicios</p>
        <p className="text-sm text-muted-foreground">
          La lista que se ve en la landing son los servicios activos — se editan en su propio módulo,
          no acá, para no duplicar el mismo dato en dos lugares.
        </p>
        <Link href="/admin/services" className="kicker-label text-foreground underline">
          Ir a Servicios
        </Link>
      </div>

      <Block title="Galería" description="Fotos de trabajos realizados. Una URL de imagen por línea (la primera se muestra más grande). Vacía = la sección no aparece." enabled={showGallery} onToggle={setShowGallery}>
        <Textarea
          name="gallery"
          rows={5}
          value={galleryText}
          onChange={(e) => setGalleryText(e.target.value)}
          placeholder={"https://...\nhttps://...\nhttps://..."}
        />
      </Block>

      <Block title="Mapa" description="Pegá el link para embeber el mapa (ver instrucciones abajo) o dejalo vacío para que se arme solo con la dirección de Identidad." enabled={showMap} onToggle={setShowMap}>
        <Input name="map_embed_url" value={mapEmbedUrl} onChange={(e) => setMapEmbedUrl(e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
        <p className="mt-2 text-xs text-muted-foreground">
          Cómo conseguirlo: en Google Maps buscá la dirección → Compartir → pestaña &quot;Insertar un
          mapa&quot; → &quot;Copiar HTML&quot; → pegá acá solo lo que está entre comillas después de{" "}
          <code className="rounded-[4px] bg-muted px-1">src=</code>.
        </p>
      </Block>

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
