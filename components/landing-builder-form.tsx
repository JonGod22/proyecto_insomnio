"use client";

import { useActionState, useEffect, useState } from "react";
import { XIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { updateLandingConfig, type LandingFormState } from "@/app/(admin)/admin/landing-builder/actions";
import type { LandingConfig, Service } from "@/lib/types";

const initialState: LandingFormState = { error: null };
const BENEFIT_MAX_CHARS = 40;

function linesToList(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim().slice(0, BENEFIT_MAX_CHARS))
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
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="surface space-y-3 bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-display text-lg leading-none">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {onToggle && (
          <label className="flex shrink-0 items-center gap-2 text-sm">
            <Checkbox checked={enabled} onCheckedChange={(v) => onToggle(v === true)} />
            Visible
          </label>
        )}
      </div>
      {(enabled ?? true) && children}
    </div>
  );
}

export function LandingBuilderForm({
  config,
  whatsappNumber,
  services,
  onToggleService,
  onSaved,
  onLiveChange,
}: {
  config: LandingConfig;
  whatsappNumber: string | null;
  services: Service[];
  onToggleService: (id: string, value: boolean) => void;
  onSaved?: () => void;
  onLiveChange?: (config: LandingConfig) => void;
}) {
  const [state, formAction, pending] = useActionState(updateLandingConfig, initialState);

  const [heroTitle, setHeroTitle] = useState(config.hero_title ?? "");
  const [locationLabel, setLocationLabel] = useState(config.location_label ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(config.hero_subtitle ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(config.hero_image_url ?? "");
  const [ctaLabel, setCtaLabel] = useState(config.cta_label ?? "Reservar turno");

  const [showBenefits, setShowBenefits] = useState(config.sections?.benefits ?? true);
  const [benefitsText, setBenefitsText] = useState((config.benefits ?? []).join("\n"));

  const [showGallery, setShowGallery] = useState(config.sections?.gallery ?? true);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(config.gallery ?? []);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const [showMap, setShowMap] = useState(config.sections?.map ?? true);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(config.map_embed_url ?? "");

  const [whatsapp, setWhatsapp] = useState(whatsappNumber ?? "");
  const [instagramUrl, setInstagramUrl] = useState(config.instagram_url ?? "");

  // Cada cambio (todavía sin guardar) se manda al padre para que la vista
  // previa se actualice al instante — nada de esperar al submit.
  useEffect(() => {
    onLiveChange?.({
      hero_title: heroTitle || undefined,
      location_label: locationLabel || undefined,
      hero_subtitle: heroSubtitle || undefined,
      hero_image_url: heroImageUrl || undefined,
      cta_label: ctaLabel || undefined,
      map_embed_url: mapEmbedUrl || undefined,
      instagram_url: instagramUrl || undefined,
      benefits: linesToList(benefitsText),
      gallery: galleryUrls,
      sections: { benefits: showBenefits, gallery: showGallery, map: showMap },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    heroTitle,
    locationLabel,
    heroSubtitle,
    heroImageUrl,
    ctaLabel,
    mapEmbedUrl,
    instagramUrl,
    showBenefits,
    benefitsText,
    showGallery,
    galleryUrls,
    showMap,
  ]);

  useEffect(() => {
    if (!pending && !state.error && state !== initialState) {
      onSaved?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  function addGalleryUrl() {
    const url = newGalleryUrl.trim();
    if (!url) return;
    setGalleryUrls((prev) => [...prev, url]);
    setNewGalleryUrl("");
  }

  function removeGalleryUrl(index: number) {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="section_benefits" value={showBenefits ? "on" : ""} />
      <input type="hidden" name="section_gallery" value={showGallery ? "on" : ""} />
      <input type="hidden" name="section_map" value={showMap ? "on" : ""} />
      {galleryUrls.map((url) => (
        <input key={url} type="hidden" name="gallery_url" value={url} />
      ))}

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Título principal</p>
        <p className="text-sm text-muted-foreground">
          El título grande del hero. A propósito es independiente del nombre del negocio que se ve
          en el menú y en el admin — podés poner otra cosa acá sin que se cambie nada más.
        </p>
        <Input name="hero_title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Ej: Yésica Studio" />
      </div>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Título secundario 1</p>
        <p className="text-sm text-muted-foreground">Línea chica arriba del título — normalmente la ubicación, pero es texto libre.</p>
        <Input name="location_label" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Ej: Bailén 102, San Martín, Mendoza" />
      </div>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Título secundario 2</p>
        <p className="text-sm text-muted-foreground">El texto debajo del título principal.</p>
        <Input name="hero_subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Ej: Turnos de lunes a sábado" />
      </div>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Hero</p>
        <p className="text-sm text-muted-foreground">Foto de fondo y texto del botón principal.</p>
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

      <Block
        title="Destacados"
        description={`Botones cortos debajo del hero, uno por línea (máx. ${BENEFIT_MAX_CHARS} caracteres cada uno). No tienen que ser 'beneficios' — pueden ser lo que quieras.`}
        enabled={showBenefits}
        onToggle={setShowBenefits}
      >
        <Textarea
          name="benefits"
          rows={4}
          value={benefitsText}
          onChange={(e) => setBenefitsText(e.target.value)}
          placeholder={"Estacionamiento propio\nWifi gratis\nMasaje de cierre"}
        />
      </Block>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Servicios</p>
        <p className="text-sm text-muted-foreground">
          El contenido de cada servicio (precio, duración, descripción) se edita en el módulo
          Servicios. Acá solo prendés o apagás cuáles se muestran en la landing.
        </p>
        <div className="space-y-1">
          {services.map((service) => (
            <label key={service.id} className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-sm hover:bg-muted">
              <Checkbox
                checked={service.show_on_landing}
                onCheckedChange={(v) => onToggleService(service.id, v === true)}
              />
              {service.name}
              {!service.active && <span className="kicker-label text-muted-foreground">(inactivo)</span>}
            </label>
          ))}
          {services.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay servicios cargados.</p>}
        </div>
      </div>

      <Block
        title="Galería"
        description="Fotos de trabajos realizados (la primera se muestra más grande)."
        enabled={showGallery}
        onToggle={setShowGallery}
      >
        <div className="space-y-2">
          {galleryUrls.map((url, i) => (
            <div key={`${url}-${i}`} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-10 shrink-0 rounded-[4px] object-cover" />
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{url}</p>
              <button
                type="button"
                onClick={() => removeGalleryUrl(i)}
                aria-label="Quitar imagen"
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
          {galleryUrls.length === 0 && <p className="text-sm text-muted-foreground">Todavía no agregaste fotos.</p>}
          <div className="flex gap-2 pt-2">
            <Input
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGalleryUrl();
                }
              }}
              placeholder="https://..."
            />
            <Button type="button" variant="outline" size="icon" onClick={addGalleryUrl} aria-label="Agregar imagen">
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </div>
      </Block>

      <Block
        title="Mapa"
        description="Pegá el link/HTML embebido de Google Maps o dejalo vacío para que se arme solo con Título secundario 1."
        enabled={showMap}
        onToggle={setShowMap}
      >
        <Input name="map_embed_url" value={mapEmbedUrl} onChange={(e) => setMapEmbedUrl(e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
        <p className="mt-2 text-xs text-muted-foreground">
          Cómo conseguirlo: en Google Maps buscá la dirección → Compartir → pestaña &quot;Insertar un
          mapa&quot; → &quot;Copiar HTML&quot; → pegá acá solo lo que está entre comillas después de{" "}
          <code className="rounded-[4px] bg-muted px-1">src=</code>.
        </p>
      </Block>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Contacto</p>
        <p className="text-sm text-muted-foreground">Botones de contacto al pie de la landing.</p>
        <div>
          <Label className="mb-1 block">WhatsApp</Label>
          <Input name="whatsapp_number" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+5492634659520" />
        </div>
        <div>
          <Label className="mb-1 block">Instagram (opcional)</Label>
          <Input name="instagram_url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/tu_negocio" />
        </div>
      </div>

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
