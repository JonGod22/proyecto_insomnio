"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FloatingAgentChat } from "@/components/floating-agent-chat";
import { cn } from "@/lib/utils";
import { getLandingPalette, buildCustomPalette } from "@/lib/landing-palettes";
import { getLandingFontPair, googleFontsCssUrl, fontFileFormat } from "@/lib/landing-fonts";
import type { Database, LandingConfig } from "@/lib/types";

export type PlatformSettings = Database["insomnio"]["Tables"]["platform_settings"]["Row"];

/** Usado cuando todavía no se cargó `platform_settings` (por ejemplo, si
 * algún caller viejo no pasa la prop) — mismos valores que estaban
 * hardcodeados acá antes de que existiera el editor interno. */
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 1,
  credit_name: "Jonathan Godoy",
  credit_github_url: "https://github.com/JonGod22",
  credit_instagram_url: "https://www.instagram.com/jonathangodoy__/",
  credit_whatsapp_url: "https://wa.me/5492634659520",
  chat_greeting: "Preguntame por precios, disponibilidad o pedí un turno.",
  chat_suggestions: ["¿Qué servicios tienen?", "Quiero reservar un turno", "¿Cuánto sale una seña?"],
  updated_at: "",
};

export type PreviewService = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_on_request: boolean;
  deposit_amount: number | null;
  duration_minutes: number;
  duration_minutes_max: number | null;
  info_content?: string | null;
  info_images?: string[] | null;
};

/** Slider a pantalla completa con scroll-snap nativo, flechas a los costados
 * y puntitos de referencia — para que quede claro que hay más fotos y se
 * pueda pasar con un clic, no solo arrastrando/scrolleando. */
function GallerySlider({ photos }: { photos: string[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const slides = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) setIndex(slides.indexOf(mostVisible.target as HTMLElement));
      },
      { root: el, threshold: 0.6 }
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [photos.length]);

  function goTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(photos.length - 1, i));
    (el.children[clamped] as HTMLElement | undefined)?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="scrollbar-none flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {photos.map((src) => (
          <div key={src} className="aspect-[4/5] w-full shrink-0 snap-center @sm:aspect-auto @sm:h-[min(750px,75vh)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Trabajo realizado" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md hover:bg-background @sm:left-6"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md hover:bg-background @sm:right-6"
          >
            <ChevronRightIcon className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir a la foto ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-4 bg-primary" : "w-1.5 bg-background/80")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ServiceInfoDialog({ service }: { service: PreviewService }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!service.info_content) return null;
  const images = service.info_images ?? [];

  return (
    <>
      <Dialog>
        <DialogTrigger
          render={
            <Button type="button" variant="link" size="sm" className="h-auto p-0">
              Conocer más
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{service.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formatDuration(service.duration_minutes, service.duration_minutes_max)}</Badge>
            <Badge>{formatPrice(service)}</Badge>
            {service.deposit_amount && (
              <Badge variant="secondary">
                seña {formatPrice({ ...service, price: service.deposit_amount, price_on_request: false })}
              </Badge>
            )}
          </div>
          <p className="whitespace-pre-line text-sm text-foreground/80">{service.info_content}</p>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setLightbox(src)}
                  aria-label="Ver foto en pantalla completa"
                  className="aspect-square overflow-hidden rounded-[8px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!lightbox} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Foto de {service.name}</DialogTitle>
          </DialogHeader>
          {lightbox && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lightbox} alt="" className="max-h-[80vh] w-full rounded-[8px] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export type PreviewBusiness = {
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  whatsapp_number: string | null;
};

function formatPrice(service: { price: number | null; price_on_request: boolean; deposit_amount: number | null }) {
  if (service.price_on_request || service.price === null) return "A consultar";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(
    service.price
  );
}

function formatDuration(min: number, max: number | null) {
  if (max && max !== min) return `${min}-${max} min`;
  return `${min} min`;
}

function waLink(number: string) {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}`;
}

/**
 * Todo el contenido visual de la landing pública, como componente puro sin
 * fetch propio. La usan dos lugares: la página pública real (server,
 * `interactive`) y la vista previa en vivo del Landing Builder (client,
 * alimentada por el estado del formulario sin guardar todavía) — así
 * garantizamos que editor y página real rendericen exactamente lo mismo.
 *
 * Todo el layout responsive de acá adentro usa container queries (@sm/@lg,
 * variantes nativas de Tailwind v4) en vez de sm:/lg: por viewport. La vista
 * previa del builder vive en un panel angosto dentro de una pantalla de
 * escritorio ancha — con breakpoints de viewport, ese panel nunca se ve
 * "mobile" aunque sea angosto, porque lo que mide Tailwind es el ancho de
 * toda la ventana, no el del panel. Con @container, el mismo componente
 * responde a su propio ancho tanto en el panel angosto como en la página
 * pública real (que ahí sí ocupa todo el viewport).
 */
export function LandingPreview({
  slug,
  business,
  services,
  config,
  interactive = true,
  platformSettings = DEFAULT_PLATFORM_SETTINGS,
}: {
  slug: string;
  business: PreviewBusiness;
  services: PreviewService[];
  config: LandingConfig;
  interactive?: boolean;
  platformSettings?: PlatformSettings;
}) {
  const computedLocation = [business.address, business.city].filter(Boolean).join(", ");
  // Título y línea de ubicación son 100% editoriales — a propósito
  // desconectados del nombre real del negocio (que sigue siendo el que se
  // ve en el nav y en el admin). Si el dueño del negocio los deja vacíos a
  // propósito, quedan vacíos — sin caer a un valor por default que no pidió.
  const heroTitle = config.hero_title ?? "";
  const locationLabel = config.location_label ?? "";
  const mapQuery = encodeURIComponent(computedLocation || business.name);
  const heroPhoto = config.hero_image_url;
  const galleryPhotos = config.gallery ?? [];
  const ctaLabel = config.cta_label || "Reservar turno";
  const showCta = config.sections?.cta ?? true;
  const servicesKind = config.services_kind === "productos" ? "Productos" : "Servicios";
  const servicesTitle = config.services_title || "Qué se puede reservar";
  const galleryTitle = config.gallery_title || "Trabajos recientes";
  const showHeaderFallback = config.header_text_fallback ?? true;
  const showBenefits = config.sections?.benefits ?? true;
  const showGallery = config.sections?.gallery ?? true;
  const showMap = config.sections?.map ?? true;
  const mapSrc = config.map_embed_url || (computedLocation ? `https://www.google.com/maps?q=${mapQuery}&output=embed` : null);
  const links = config.links ?? [];
  const hasContact = Boolean(business.whatsapp_number || links.length > 0);
  const palette =
    config.theme_palette === "custom" && config.custom_palette
      ? buildCustomPalette(config.custom_palette)
      : getLandingPalette(config.theme_palette);
  const fontPair = getLandingFontPair(
    config.font_id,
    config.custom_font_family,
    config.custom_font_family_body,
    config.custom_font_file_heading,
    config.custom_font_file_body
  );
  const headingStyle = fontPair.heading.family ? { fontFamily: fontPair.heading.family } : undefined;

  function preventNav(e: React.MouseEvent) {
    if (!interactive) e.preventDefault();
  }

  return (
    <main
      className={cn("@container flex-1 bg-background text-foreground", fontPair.body.className)}
      style={
        {
          "--background": palette.background,
          "--foreground": palette.foreground,
          "--card": palette.card,
          "--card-foreground": palette.cardForeground,
          "--primary": palette.primary,
          "--primary-foreground": palette.primaryForeground,
          "--primary-glow": palette.primaryGlow,
          "--primary-dark": palette.primaryDark,
          "--accent": palette.primary,
          "--accent-foreground": palette.primaryForeground,
          "--muted": palette.muted,
          "--muted-foreground": palette.mutedForeground,
          "--border": palette.border,
          ...(fontPair.body.family ? { fontFamily: fontPair.body.family } : {}),
        } as React.CSSProperties
      }
    >
      {/* Tipografía personalizada (plan Pro): se carga en vivo desde Google
          Fonts por nombre de familia — las parejas curadas usan next/font
          (autohospedadas) y no necesitan esto. */}
      {/* Tipografía personalizada (plan Pro): archivo propio vía @font-face,
          o si no hay archivo, el nombre de una familia de Google Fonts
          cargada en vivo — las parejas curadas usan next/font (autohospedadas)
          y no necesitan nada de esto. */}
      {(fontPair.heading.fileUrl || fontPair.body.fileUrl) && (
        <style>
          {fontPair.heading.fileUrl &&
            `@font-face { font-family: "${fontPair.heading.family}"; src: url("${fontPair.heading.fileUrl}") format("${fontFileFormat(fontPair.heading.fileUrl)}"); font-display: swap; }`}
          {fontPair.body.fileUrl &&
            `@font-face { font-family: "${fontPair.body.family}"; src: url("${fontPair.body.fileUrl}") format("${fontFileFormat(fontPair.body.fileUrl)}"); font-display: swap; }`}
        </style>
      )}
      {!fontPair.body.fileUrl && fontPair.body.family && (
        <link rel="stylesheet" href={googleFontsCssUrl(fontPair.body.family)} />
      )}
      {!fontPair.heading.fileUrl && fontPair.heading.family && fontPair.heading.family !== fontPair.body.family && (
        <link rel="stylesheet" href={googleFontsCssUrl(fontPair.heading.family)} />
      )}
      <div className="relative">
        {/* Flota transparente/vidrio sobre la foto del hero, no ocupa su
            propio bloque blanco — por eso vive adentro del <header>. */}
        <nav className="absolute inset-x-0 top-0 z-10 flex items-center justify-center bg-black/25 px-6 py-4 backdrop-blur-md @sm:px-12 @lg:justify-between">
          {config.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logo_url} alt={business.name} className="h-8 w-auto max-w-40 object-contain" />
          ) : showHeaderFallback ? (
            <span className={cn("type-display text-lg leading-none text-white", fontPair.heading.className)} style={headingStyle}>{business.name}</span>
          ) : (
            <span />
          )}
          {/* Solo desktop — en mobile el encabezado queda con el logo/nombre
              solo, centrado, sin estos botones. */}
          <div className="hidden items-center gap-3 @lg:flex">
            <Button
              render={<Link href="#servicios" onClick={preventNav} />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              {servicesKind}
            </Button>
            <Button
              render={<Link href={`/${slug}/booking`} onClick={preventNav} />}
              nativeButton={false}
              size="sm"
              className={fontPair.heading.className}
              style={headingStyle}
            >
              Reservar
            </Button>
          </div>
        </nav>

        <header className="relative flex min-h-[560px] items-end overflow-hidden bg-foreground @sm:min-h-[640px]">
          {heroPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroPhoto} alt={`Espacio de ${business.name}`} className="absolute inset-0 h-full w-full object-cover" />
          )}
        <div className="relative w-full px-6 py-12 @sm:px-12 @sm:py-16">
          <div className="mx-auto max-w-6xl text-center @lg:text-left">
            {locationLabel && (
              <p className="kicker-label mb-3 text-primary" style={{ color: config.location_label_color || undefined }}>
                {locationLabel}
              </p>
            )}
            {heroTitle && (
              <h1
                className={cn("type-display mb-4 text-4xl leading-[0.95] text-white @sm:text-6xl", fontPair.heading.className)}
                style={{ ...headingStyle, color: config.hero_title_color || undefined }}
              >
                {heroTitle}
              </h1>
            )}
            {config.hero_subtitle && (
              <p className="mx-auto mb-6 max-w-xl text-lg text-white/85 @lg:mx-0" style={{ color: config.hero_subtitle_color || undefined }}>
                {config.hero_subtitle}
              </p>
            )}
            {showCta && (
              <div className="flex flex-wrap items-center justify-center gap-3 @lg:justify-start">
                <Button
                  render={<Link href={`/${slug}/booking`} onClick={preventNav} />}
                  nativeButton={false}
                  size="lg"
                  className={cn("halo", fontPair.heading.className)}
                  style={headingStyle}
                >
                  {ctaLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
        </header>
      </div>

      {showBenefits && config.benefits && config.benefits.length > 0 && (
        <section className="px-6 py-6 @sm:px-12">
          <div className="mx-auto flex max-w-5xl flex-col items-stretch gap-3 @lg:flex-row @lg:flex-wrap @lg:justify-center">
            {config.benefits.map((benefit) => (
              <span
                key={benefit}
                className="surface kicker-label flex min-h-16 w-full items-center justify-center rounded-[24px] bg-card px-6 py-3 text-center leading-snug text-foreground @lg:w-64"
              >
                {benefit}
              </span>
            ))}
          </div>
        </section>
      )}

      <section id="servicios" className="scroll-mt-20 px-6 py-16 @sm:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="kicker-label mb-2 text-center text-muted-foreground @lg:text-left">{servicesKind}</p>
          <h2
            className={cn(
              "type-display mb-8 text-center text-3xl leading-none @lg:text-left @lg:text-4xl",
              fontPair.heading.className
            )}
            style={headingStyle}
          >
            {servicesTitle}
          </h2>
          {/* Los breakpoints @container comparan siempre contra el ancho de
              <main> (el único @container de toda la página), no contra el
              ancho local de la grilla o la tarjeta — por eso acá se usan
              @lg/@5xl (umbrales bien por encima de cualquier celular real)
              en vez de @sm/@lg, que un celular ancho llega a cruzar
              igual y rompía la columna única en mobile. */}
          <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @5xl:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="flex h-full flex-col">
                <CardContent className="flex h-full flex-col gap-3 text-center @lg:gap-4 @lg:text-left">
                  <div>
                    <CardTitle
                      className={cn("text-base leading-tight @lg:text-lg", fontPair.heading.className)}
                      style={headingStyle}
                    >
                      {service.name}
                    </CardTitle>
                    {service.description && (
                      <p className="mt-1 text-xs leading-snug text-muted-foreground @lg:text-sm">{service.description}</p>
                    )}
                    <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground @lg:mt-2 @lg:text-xs">
                      Duración: {formatDuration(service.duration_minutes, service.duration_minutes_max)} aproximadamente
                    </p>
                    <ServiceInfoDialog service={service} />
                  </div>

                  {/* Mobile: precio arriba, reservar abajo, todo centrado.
                      Desktop: reservar a la izquierda, precio a la derecha,
                      misma fila — se logra reordenando con `order`, no
                      cambiando el DOM, porque el apilado vertical necesita
                      el precio primero y la fila horizontal lo necesita
                      último. */}
                  <div className="mt-auto flex flex-col items-center gap-2 @lg:flex-row @lg:items-center @lg:justify-between">
                    <p className={cn("order-1 text-sm font-medium text-foreground @lg:order-2", fontPair.heading.className)} style={headingStyle}>
                      {formatPrice(service)}
                      {service.deposit_amount
                        ? ` · seña ${formatPrice({ ...service, price: service.deposit_amount, price_on_request: false })}`
                        : ""}
                    </p>
                    <Button
                      render={<Link href={`/${slug}/booking?service=${service.id}`} onClick={preventNav} />}
                      nativeButton={false}
                      variant="dark"
                      size="sm"
                      className={cn("order-2 w-fit @lg:order-1", fontPair.heading.className)}
                      style={headingStyle}
                    >
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {showGallery && galleryPhotos.length > 0 && (
        <section className="py-16">
          <div className="mx-auto mb-8 max-w-6xl px-6 @sm:px-12">
            <p className="kicker-label mb-2 text-center text-muted-foreground @lg:text-left">Galería</p>
            <h2
              className={cn("type-display text-center text-3xl leading-none @sm:text-4xl @lg:text-left", fontPair.heading.className)}
              style={headingStyle}
            >
              {galleryTitle}
            </h2>
          </div>
          {/* Slider a todo el ancho de la pantalla (sin el max-w del resto del
              contenido), con flechas y puntitos — no depende de que se
              entienda que hay que arrastrar/scrollear. */}
          <GallerySlider photos={galleryPhotos} />
        </section>
      )}

      <footer className="py-16">
        {hasContact && (
          <div className="mb-8 flex justify-center gap-3 px-6 @sm:px-12">
            {business.whatsapp_number && (
              <Button
                render={<a href={waLink(business.whatsapp_number)} target="_blank" rel="noopener noreferrer" onClick={preventNav} />}
                nativeButton={false}
                className={cn("halo", fontPair.heading.className)}
                style={headingStyle}
              >
                WhatsApp
              </Button>
            )}
            {links.map((link) => (
              <Button
                key={link.url}
                render={<a href={link.url} target="_blank" rel="noopener noreferrer" onClick={preventNav} />}
                nativeButton={false}
                variant="outline"
                className={fontPair.heading.className}
                style={headingStyle}
              >
                {link.label}
              </Button>
            ))}
          </div>
        )}

        {/* Nombre + ubicación pegado al mapa (tiene más sentido ahí, es la
            dirección del lugar) en vez de arriba de los botones de contacto. */}
        <p className="kicker-label mb-4 px-6 text-center text-muted-foreground @sm:px-12">
          {business.name}
          {computedLocation ? ` · ${computedLocation}` : ""}
        </p>

        {showMap && mapSrc && (
          <div className="aspect-[4/5] w-full overflow-hidden @sm:aspect-[21/9]">
            <iframe
              src={mapSrc}
              className={cn("h-full w-full border-0", !interactive && "pointer-events-none")}
              loading="lazy"
              title={`Ubicación de ${business.name}`}
            />
          </div>
        )}
      </footer>

      <div id="landing-footer" className="bg-foreground px-6 py-6 text-background @sm:px-12 @lg:pt-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center @lg:flex-row @lg:justify-between @lg:text-left">
          <p className="kicker-label text-background/60">Sitio desarrollado por {platformSettings.credit_name}</p>
          <div className="flex items-center gap-5">
            {platformSettings.credit_github_url && (
              <a href={platformSettings.credit_github_url} target="_blank" rel="noopener noreferrer" className="kicker-label text-background hover:text-primary">
                GitHub
              </a>
            )}
            {platformSettings.credit_instagram_url && (
              <a href={platformSettings.credit_instagram_url} target="_blank" rel="noopener noreferrer" className="kicker-label text-background hover:text-primary">
                Instagram
              </a>
            )}
            {platformSettings.credit_whatsapp_url && (
              <a href={platformSettings.credit_whatsapp_url} target="_blank" rel="noopener noreferrer" className="kicker-label text-background hover:text-primary">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* El agente (barra + velo detrás, ambos dentro de este mismo
          componente) es una función del plan Business — cuando exista el
          sistema de planes, este único condicional apaga las dos cosas
          juntas para negocios sin suscripción. Por ahora siempre se
          muestra porque no hay planes reales todavía. */}
      {true && (
        <FloatingAgentChat
          slug={slug}
          businessName={business.name}
          greeting={platformSettings.chat_greeting}
          suggestions={platformSettings.chat_suggestions}
        />
      )}
    </main>
  );
}
