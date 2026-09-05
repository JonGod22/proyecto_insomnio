"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { XIcon, PlusIcon, UploadIcon, CrownIcon } from "lucide-react";
import { ProBadge } from "@/components/pro-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadLandingLogo } from "@/app/(admin)/admin/landing-builder/actions";
import { LANDING_PALETTES } from "@/lib/landing-palettes";
import { LANDING_FONT_PAIRS, LANDING_FONT_PAIR_IDS } from "@/lib/landing-fonts";
import { cn } from "@/lib/utils";
import type { LandingConfig, Service } from "@/lib/types";

const BENEFIT_MAX_CHARS = 40;
const BENEFIT_MAX_ITEMS = 6;
const FREE_SERVICES_ON_LANDING = 4;
const LINKS_MAX = 3;

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex shrink-0">
      <button
        type="button"
        aria-label="Más información"
        className="flex size-3.5 items-center justify-center rounded-full border border-border text-[9px] leading-none text-muted-foreground hover:border-primary hover:text-primary"
      >
        ?
      </button>
      <span className="pointer-events-none absolute left-0 top-full z-10 mt-1.5 w-56 rounded-[8px] border border-border bg-popover px-2.5 py-1.5 text-[11px] leading-tight text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}

function Block({
  title,
  tooltip,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  tooltip?: string;
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="surface space-y-3 bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <p className="type-display text-lg leading-none">{title}</p>
          {tooltip && <InfoTooltip text={tooltip} />}
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
  formId,
  formAction,
  error,
  config,
  whatsappNumber,
  services,
  onToggleService,
  onLiveChange,
}: {
  formId: string;
  formAction: (formData: FormData) => void;
  error: string | null;
  config: LandingConfig;
  whatsappNumber: string | null;
  services: Service[];
  onToggleService: (id: string, value: boolean) => void;
  onLiveChange?: (config: LandingConfig) => void;
}) {
  const [heroTitle, setHeroTitle] = useState(config.hero_title ?? "");
  const [locationLabel, setLocationLabel] = useState(config.location_label ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(config.hero_subtitle ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(config.hero_image_url ?? "");
  const [logoUrl, setLogoUrl] = useState(config.logo_url ?? "");
  const [ctaLabel, setCtaLabel] = useState(config.cta_label ?? "Reservar turno");

  const [showBenefits, setShowBenefits] = useState(config.sections?.benefits ?? true);
  const [benefits, setBenefits] = useState<string[]>(config.benefits ?? []);
  const [newBenefit, setNewBenefit] = useState("");

  const [showGallery, setShowGallery] = useState(config.sections?.gallery ?? true);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(config.gallery ?? []);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const [showMap, setShowMap] = useState(config.sections?.map ?? true);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(config.map_embed_url ?? "");

  const [whatsapp, setWhatsapp] = useState(whatsappNumber ?? "");
  const [links, setLinks] = useState<{ label: string; url: string }[]>(config.links ?? []);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [themePalette, setThemePalette] = useState(config.theme_palette ?? "default");
  const [fontId, setFontId] = useState(config.font_id ?? "default");

  const [logoError, setLogoError] = useState<string | null>(null);
  const [uploadingLogo, startLogoUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoFile(file: File | undefined) {
    if (!file) return;
    setLogoError(null);
    const fd = new FormData();
    fd.set("file", file);
    startLogoUpload(async () => {
      const result = await uploadLandingLogo(fd);
      if (result.error) setLogoError(result.error);
      else if (result.url) setLogoUrl(result.url);
    });
  }

  // Cada cambio (todavía sin guardar) se manda al padre para que la vista
  // previa se actualice al instante — nada de esperar al submit.
  useEffect(() => {
    onLiveChange?.({
      hero_title: heroTitle || undefined,
      logo_url: logoUrl || undefined,
      location_label: locationLabel || undefined,
      hero_subtitle: heroSubtitle || undefined,
      hero_image_url: heroImageUrl || undefined,
      cta_label: ctaLabel || undefined,
      map_embed_url: mapEmbedUrl || undefined,
      links,
      theme_palette: themePalette,
      font_id: fontId,
      benefits,
      gallery: galleryUrls,
      sections: { benefits: showBenefits, gallery: showGallery, map: showMap },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    heroTitle,
    logoUrl,
    locationLabel,
    heroSubtitle,
    heroImageUrl,
    ctaLabel,
    mapEmbedUrl,
    links,
    themePalette,
    fontId,
    showBenefits,
    benefits,
    showGallery,
    galleryUrls,
    showMap,
  ]);

  function addGalleryUrl() {
    const url = newGalleryUrl.trim();
    if (!url) return;
    setGalleryUrls((prev) => [...prev, url]);
    setNewGalleryUrl("");
  }

  function removeGalleryUrl(index: number) {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function addBenefit() {
    const value = newBenefit.trim().slice(0, BENEFIT_MAX_CHARS);
    if (!value || benefits.length >= BENEFIT_MAX_ITEMS) return;
    setBenefits((prev) => [...prev, value]);
    setNewBenefit("");
  }

  function removeBenefit(index: number) {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  }

  function addLink() {
    const label = newLinkLabel.trim();
    const url = newLinkUrl.trim();
    if (!label || !url || links.length >= LINKS_MAX) return;
    setLinks((prev) => [...prev, { label, url }]);
    setNewLinkLabel("");
    setNewLinkUrl("");
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form id={formId} action={formAction} className="space-y-4">
      <input type="hidden" name="section_benefits" value={showBenefits ? "on" : ""} />
      <input type="hidden" name="section_gallery" value={showGallery ? "on" : ""} />
      <input type="hidden" name="section_map" value={showMap ? "on" : ""} />
      <input type="hidden" name="theme_palette" value={themePalette} />
      <input type="hidden" name="font_id" value={fontId} />
      {galleryUrls.map((url) => (
        <input key={url} type="hidden" name="gallery_url" value={url} />
      ))}
      {benefits.map((benefit, i) => (
        <input key={`${benefit}-${i}`} type="hidden" name="benefit_item" value={benefit} />
      ))}
      {links.map((link, i) => (
        <span key={`${link.url}-${i}`}>
          <input type="hidden" name="link_label" value={link.label} />
          <input type="hidden" name="link_url" value={link.url} />
        </span>
      ))}

      <div className="surface space-y-5 bg-card p-5">
        <div>
          <p className="kicker-label text-primary">Encabezado</p>
          <p className="type-display text-lg leading-none">Logo y títulos</p>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center gap-1.5">
            <Label className="block">Logo</Label>
            <InfoTooltip text="Formatos disponibles: PNG o SVG. Si no cargás uno, se muestra el título principal como texto." />
          </div>
          <div className="flex gap-2">
            <Input
              name="logo_url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://... o subilo desde tu computadora"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="shrink-0 gap-1.5"
            >
              <UploadIcon className="size-4" />
              {uploadingLogo ? "Subiendo..." : "Subir archivo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.svg,image/png,image/svg+xml"
              className="hidden"
              onChange={(e) => handleLogoFile(e.target.files?.[0])}
            />
          </div>
          {logoError && <p className="text-xs text-destructive">{logoError}</p>}
          {logoUrl && (
            <div className="mt-2 flex h-16 items-center rounded-[6px] bg-foreground px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Vista previa del logo" className="h-8 w-auto max-w-40 object-contain" />
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label className="mb-1 block">Título principal</Label>
          <Input name="hero_title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Ej: Yésica Studio" />
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label className="mb-1 block">Título secundario 1</Label>
          <Input name="location_label" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Ej: Bailén 102, San Martín, Mendoza" />
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label className="mb-1 block">Título secundario 2</Label>
          <Input name="hero_subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Ej: Turnos de lunes a sábado" />
        </div>
      </div>

      <div className="surface space-y-3 bg-card p-5">
        <div className="flex items-center gap-1.5">
          <p className="type-display text-lg leading-none">Hero</p>
          <InfoTooltip text="La franja grande de arriba de la landing: la foto de fondo y el texto del botón que lleva a reservar." />
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

      <div className="surface space-y-4 bg-card p-5">
        <div>
          <p className="kicker-label text-primary">Identidad</p>
          <p className="type-display text-lg leading-none">Estilo</p>
          <p className="mt-1 text-sm text-muted-foreground">Paleta de colores y tipografía de la landing.</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <CrownIcon className="size-3 text-violet-600" /> marca lo que va en el plan Pro — hoy no está limitado.
          </p>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label className="mb-1 block">Paleta de colores</Label>
          <div className="flex flex-wrap gap-3">
            {LANDING_PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setThemePalette(p.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-[8px] border-2 p-2 text-xs",
                  themePalette === p.id ? "border-primary" : "border-transparent hover:border-border"
                )}
              >
                <span className="flex size-8 overflow-hidden rounded-full border border-border">
                  <span className="h-full w-1/3" style={{ background: p.background }} />
                  <span className="h-full w-1/3" style={{ background: p.primary }} />
                  <span className="h-full w-1/3" style={{ background: p.foreground }} />
                </span>
                {p.name}
              </button>
            ))}
            <button
              type="button"
              disabled
              title="Disponible en el plan Pro"
              className="flex flex-col items-center gap-1.5 rounded-[8px] border-2 border-dashed border-border p-2 text-xs opacity-70"
            >
              <span className="flex size-8 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                <CrownIcon className="size-3.5" />
              </span>
              <span className="flex items-center gap-1">
                Personalizada <ProBadge />
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label className="mb-1 block">Pareja tipográfica</Label>
          <div className="grid grid-cols-1 gap-2 @sm:grid-cols-2">
            {LANDING_FONT_PAIR_IDS.map((id) => {
              const pair = LANDING_FONT_PAIRS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFontId(id)}
                  className={cn(
                    "rounded-[8px] border px-3 py-2 text-left",
                    fontId === id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  )}
                >
                  <span className={cn("type-display block text-xl leading-none", pair.heading.className)}>
                    {pair.label}
                  </span>
                  <span className={cn("mt-1 block text-xs text-muted-foreground", pair.body.className)}>
                    {pair.description}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              disabled
              title="Disponible en el plan Pro"
              className="rounded-[8px] border-2 border-dashed border-border px-3 py-2 text-left opacity-70"
            >
              <span className="flex items-center gap-1.5 text-xl leading-none">
                Personalizada <ProBadge />
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">Tu propia tipografía, subida por vos.</span>
            </button>
          </div>
        </div>
      </div>

      <Block
        title="Destacados"
        tooltip={`Botones cortos debajo del hero — hasta ${BENEFIT_MAX_ITEMS}, de ${BENEFIT_MAX_CHARS} caracteres cada uno.`}
        enabled={showBenefits}
        onToggle={setShowBenefits}
      >
        <div className="space-y-2">
          {benefits.map((benefit, i) => (
            <div key={`${benefit}-${i}`} className="flex items-center gap-2 rounded-[6px] border border-border px-3 py-2">
              <span className="kicker-label shrink-0 text-muted-foreground">{i + 1}</span>
              <p className="min-w-0 flex-1 truncate text-sm">{benefit}</p>
              <button
                type="button"
                onClick={() => removeBenefit(i)}
                aria-label="Quitar destacado"
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
          {benefits.length === 0 && <p className="text-sm text-muted-foreground">Todavía no agregaste destacados.</p>}
          {benefits.length < BENEFIT_MAX_ITEMS ? (
            <div className="flex gap-2 pt-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBenefit();
                  }
                }}
                maxLength={BENEFIT_MAX_CHARS}
                placeholder="Ej: Estacionamiento propio"
              />
              <Button type="button" variant="outline" size="icon" onClick={addBenefit} aria-label="Agregar destacado">
                <PlusIcon className="size-4" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Llegaste al máximo de {BENEFIT_MAX_ITEMS} destacados.</p>
          )}
        </div>
      </Block>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Servicios</p>
        {services.length > FREE_SERVICES_ON_LANDING && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CrownIcon className="size-3 text-violet-600" /> los primeros {FREE_SERVICES_ON_LANDING} son gratis en la
            landing — del {FREE_SERVICES_ON_LANDING + 1}º en adelante quedan marcados Pro (hoy tampoco están
            limitados).
          </p>
        )}
        <div className="space-y-1">
          {services.map((service, i) => (
            <label key={service.id} className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-sm hover:bg-muted">
              <Checkbox
                checked={service.show_on_landing}
                onCheckedChange={(v) => onToggleService(service.id, v === true)}
              />
              {service.name}
              {!service.active && <span className="kicker-label text-muted-foreground">(inactivo)</span>}
              {i >= FREE_SERVICES_ON_LANDING && <ProBadge />}
            </label>
          ))}
          {services.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay servicios cargados.</p>}
        </div>
      </div>

      <Block title="Galería" enabled={showGallery} onToggle={setShowGallery}>
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
        tooltip={
          'Pegá el link/HTML embebido de Google Maps o dejalo vacío para que se arme solo con Título secundario 1. Para conseguirlo: en Google Maps buscá la dirección → Compartir → pestaña "Insertar un mapa" → "Copiar HTML" → pegá acá solo lo que está entre comillas después de src=.'
        }
        enabled={showMap}
        onToggle={setShowMap}
      >
        <Input name="map_embed_url" value={mapEmbedUrl} onChange={(e) => setMapEmbedUrl(e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
      </Block>

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Contacto y redes</p>
        <p className="text-sm text-muted-foreground">Botones de contacto al pie de la landing.</p>
        <div>
          <Label className="mb-1 block">WhatsApp</Label>
          <Input name="whatsapp_number" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+5492634659520" />
          <p className="mt-1 text-xs text-muted-foreground">
            Solo el número, con código de país. El link de WhatsApp (wa.me) se arma solo.
          </p>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <Label className="mb-1 block">Otros links (opcional, hasta {LINKS_MAX})</Label>
          <p className="text-xs text-muted-foreground">
            Instagram, TikTok, tu otra web — el título de cada botón es el que vos escribas.
          </p>
          {links.map((link, i) => (
            <div key={`${link.url}-${i}`} className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm">
                <span className="font-medium">{link.label}</span>{" "}
                <span className="text-xs text-muted-foreground">{link.url}</span>
              </p>
              <button
                type="button"
                onClick={() => removeLink(i)}
                aria-label="Quitar link"
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
          {links.length < LINKS_MAX && (
            <div className="flex gap-2">
              <Input
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                placeholder="Ej: Instagram"
                className="w-32 shrink-0"
              />
              <Input
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" size="icon" onClick={addLink} aria-label="Agregar link">
                <PlusIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full">
        Guardar cambios
      </Button>
    </form>
  );
}
