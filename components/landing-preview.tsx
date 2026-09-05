"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FloatingAgentChat } from "@/components/floating-agent-chat";
import { cn } from "@/lib/utils";
import { getLandingPalette, buildCustomPalette } from "@/lib/landing-palettes";
import { getLandingFontPair, googleFontsCssUrl } from "@/lib/landing-fonts";
import type { LandingConfig } from "@/lib/types";

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
}: {
  slug: string;
  business: PreviewBusiness;
  services: PreviewService[];
  config: LandingConfig;
  interactive?: boolean;
}) {
  const computedLocation = [business.address, business.city].filter(Boolean).join(", ");
  // Título y línea de ubicación son 100% editoriales — a propósito
  // desconectados del nombre real del negocio (que sigue siendo el que se
  // ve en el nav y en el admin). Si nunca se tocó el builder, arrancan
  // mostrando el nombre/dirección real como valor por default razonable.
  const heroTitle = config.hero_title || business.name;
  const locationLabel = config.location_label ?? computedLocation;
  const mapQuery = encodeURIComponent(computedLocation || business.name);
  const heroPhoto = config.hero_image_url;
  const galleryPhotos = config.gallery ?? [];
  const ctaLabel = config.cta_label || "Reservar turno";
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
  const fontPair = getLandingFontPair(config.font_id, config.custom_font_family, config.custom_font_family_body);
  const headingStyle = fontPair.heading.family ? { fontFamily: fontPair.heading.family } : undefined;

  function preventNav(e: React.MouseEvent) {
    if (!interactive) e.preventDefault();
  }

  return (
    <main
      className={cn("@container flex-1 bg-background pb-28 text-foreground sm:pb-32", fontPair.body.className)}
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
      {fontPair.body.family && <link rel="stylesheet" href={googleFontsCssUrl(fontPair.body.family)} />}
      {fontPair.heading.family && fontPair.heading.family !== fontPair.body.family && (
        <link rel="stylesheet" href={googleFontsCssUrl(fontPair.heading.family)} />
      )}
      <div className="relative">
        {/* Flota transparente/vidrio sobre la foto del hero, no ocupa su
            propio bloque blanco — por eso vive adentro del <header>. */}
        <nav className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-black/25 px-6 py-4 backdrop-blur-md @sm:px-12">
          {config.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logo_url} alt={business.name} className="h-8 w-auto max-w-40 object-contain" />
          ) : (
            <span className={cn("type-display text-lg leading-none text-white", fontPair.heading.className)} style={headingStyle}>{business.name}</span>
          )}
          <div className="flex items-center gap-3">
            <Button
              render={<Link href="#servicios" onClick={preventNav} />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="hidden text-white hover:bg-white/10 hover:text-white @sm:inline-flex"
            >
              Servicios
            </Button>
            <Button
              render={<Link href={`/${slug}/booking`} onClick={preventNav} />}
              nativeButton={false}
              size="sm"
            >
              Reservar
            </Button>
          </div>
        </nav>

        <header className="relative flex min-h-[560px] items-end overflow-hidden bg-foreground @sm:min-h-[640px]">
          {heroPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroPhoto}
              alt={`Espacio de ${business.name}`}
              className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1px]"
            />
          )}
          {/* Velo oscuro siempre presente (con o sin foto de fondo) — garantiza
              contraste para el texto claro del hero sin depender de qué tan
              oscura sea la imagen o la paleta elegida. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
        <div className="relative w-full px-6 py-12 @sm:px-12 @sm:py-16">
          <div className="mx-auto max-w-3xl">
            {locationLabel && <p className="kicker-label mb-3 text-primary">{locationLabel}</p>}
            <h1 className={cn("type-display mb-4 text-4xl leading-[0.95] text-white @sm:text-6xl", fontPair.heading.className)} style={headingStyle}>{heroTitle}</h1>
            {config.hero_subtitle && <p className="mb-6 max-w-xl text-lg text-white/85">{config.hero_subtitle}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                render={<Link href={`/${slug}/booking`} onClick={preventNav} />}
                nativeButton={false}
                size="lg"
                className="halo"
              >
                {ctaLabel}
              </Button>
            </div>
          </div>
        </div>
        </header>
      </div>

      {showBenefits && config.benefits && config.benefits.length > 0 && (
        <section className="px-6 py-6 @sm:px-12">
          <div className="mx-auto flex max-w-5xl flex-col items-stretch gap-3 @sm:flex-row @sm:flex-wrap @sm:justify-center">
            {config.benefits.map((benefit) => (
              <span
                key={benefit}
                className="surface kicker-label flex min-h-16 w-full items-center justify-center rounded-[24px] bg-card px-6 py-3 text-center leading-snug text-foreground @sm:w-64"
              >
                {benefit}
              </span>
            ))}
          </div>
        </section>
      )}

      <section id="servicios" className="scroll-mt-20 px-6 py-16 @sm:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="kicker-label mb-2 text-muted-foreground">Servicios</p>
          <h2 className={cn("type-display mb-8 text-3xl leading-none @sm:text-4xl", fontPair.heading.className)} style={headingStyle}>Qué se puede reservar</h2>
          <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
                  {service.description && <p className="text-sm text-muted-foreground">{service.description}</p>}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline">{formatDuration(service.duration_minutes, service.duration_minutes_max)}</Badge>
                    <Badge>{formatPrice(service)}</Badge>
                    {service.deposit_amount && (
                      <Badge variant="secondary">
                        seña {formatPrice({ ...service, price: service.deposit_amount, price_on_request: false })}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="mt-auto flex flex-wrap items-center gap-3">
                    <Button
                      render={<Link href={`/${slug}/booking?service=${service.id}`} onClick={preventNav} />}
                      nativeButton={false}
                      variant="dark"
                      size="sm"
                      className="w-fit"
                    >
                      Reservar
                    </Button>
                    <ServiceInfoDialog service={service} />
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
            <p className="kicker-label mb-2 text-muted-foreground">Galería</p>
            <h2 className={cn("type-display text-3xl leading-none @sm:text-4xl", fontPair.heading.className)} style={headingStyle}>Trabajos recientes</h2>
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
                className="halo"
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

      <div className="bg-foreground px-6 py-6 text-background @sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center @sm:flex-row @sm:justify-between @sm:text-left">
          <p className="kicker-label text-background/60">Sitio desarrollado por Jonathan Godoy</p>
          <div className="flex items-center gap-5">
            <a href="https://github.com/JonGod22" target="_blank" rel="noopener noreferrer" className="kicker-label text-background hover:text-primary">
              GitHub
            </a>
            <a
              href="https://www.instagram.com/jonathangodoy__/"
              target="_blank"
              rel="noopener noreferrer"
              className="kicker-label text-background hover:text-primary"
            >
              Instagram
            </a>
            <a href="https://wa.me/5492634659520" target="_blank" rel="noopener noreferrer" className="kicker-label text-background hover:text-primary">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <FloatingAgentChat slug={slug} businessName={business.name} />
    </main>
  );
}
