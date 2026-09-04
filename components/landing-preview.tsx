"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
};

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
  const hasContact = Boolean(business.whatsapp_number || config.instagram_url);

  function preventNav(e: React.MouseEvent) {
    if (!interactive) e.preventDefault();
  }

  return (
    <main className="@container flex-1">
      <div className="relative">
        {/* Flota transparente/vidrio sobre la foto del hero, no ocupa su
            propio bloque blanco — por eso vive adentro del <header>. */}
        <nav className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-black/25 px-6 py-4 backdrop-blur-md @sm:px-12">
          {config.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logo_url} alt={business.name} className="h-8 w-auto max-w-40 object-contain" />
          ) : (
            <span className="type-display text-lg leading-none text-background">{business.name}</span>
          )}
          <div className="flex items-center gap-3">
            <Button
              render={<Link href="#servicios" onClick={preventNav} />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="hidden text-background hover:bg-background/10 hover:text-background @sm:inline-flex"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative w-full px-6 py-12 @sm:px-12 @sm:py-16">
          <div className="mx-auto max-w-3xl">
            {locationLabel && <p className="kicker-label mb-3 text-primary">{locationLabel}</p>}
            <h1 className="type-display mb-4 text-4xl leading-[0.95] text-background @sm:text-6xl">{heroTitle}</h1>
            {config.hero_subtitle && <p className="mb-6 max-w-xl text-lg text-background/85">{config.hero_subtitle}</p>}
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
          <h2 className="type-display mb-8 text-3xl leading-none @sm:text-4xl">Qué se puede reservar</h2>
          <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
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
                  {service.description && <p className="mb-4 text-sm text-foreground/70">{service.description}</p>}
                  <Button
                    render={<Link href={`/${slug}/booking?service=${service.id}`} onClick={preventNav} />}
                    nativeButton={false}
                    variant="dark"
                    size="sm"
                    className="mt-auto w-fit"
                  >
                    Reservar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {showGallery && galleryPhotos.length > 0 && (
        <section className="px-6 py-16 @sm:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="kicker-label mb-2 text-muted-foreground">Galería</p>
            <h2 className="type-display mb-8 text-3xl leading-none @sm:text-4xl">Trabajos recientes</h2>
            <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @lg:grid-cols-3">
              {galleryPhotos.map((src) => (
                <div key={src} className="relative aspect-[2/1] overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Trabajo realizado" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-16">
        <p className="kicker-label mb-4 px-6 text-center text-muted-foreground @sm:px-12">
          {business.name}
          {computedLocation ? ` · ${computedLocation}` : ""}
        </p>

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
            {config.instagram_url && (
              <Button
                render={<a href={config.instagram_url} target="_blank" rel="noopener noreferrer" onClick={preventNav} />}
                nativeButton={false}
                variant="outline"
              >
                Instagram
              </Button>
            )}
          </div>
        )}

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
    </main>
  );
}
