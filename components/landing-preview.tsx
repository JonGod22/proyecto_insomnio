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

/**
 * Todo el contenido visual de la landing pública, como componente puro sin
 * fetch propio. La usan dos lugares: la página pública real (server,
 * `interactive`) y la vista previa en vivo del Landing Builder (client,
 * alimentada por el estado del formulario sin guardar todavía) — así
 * garantizamos que editor y página real rendericen exactamente lo mismo.
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
  const location = [business.address, business.city].filter(Boolean).join(", ");
  const mapQuery = encodeURIComponent(location || business.name);
  const heroPhoto = config.hero_image_url;
  const galleryPhotos = config.gallery ?? [];
  const ctaLabel = config.cta_label || "Reservar turno";
  const showBenefits = config.sections?.benefits ?? true;
  const showGallery = config.sections?.gallery ?? true;
  const showReviews = config.sections?.reviews ?? true;
  const showMap = config.sections?.map ?? true;
  const mapSrc = config.map_embed_url || (location ? `https://www.google.com/maps?q=${mapQuery}&output=embed` : null);

  function preventNav(e: React.MouseEvent) {
    if (!interactive) e.preventDefault();
  }

  return (
    <main className="flex-1">
      <nav className="surface flex items-center justify-between bg-card px-6 py-4 sm:px-12">
        <span className="type-display text-lg leading-none">{business.name}</span>
        <div className="flex items-center gap-3">
          <Button
            render={<Link href="#servicios" onClick={preventNav} />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Servicios
          </Button>
          <Button
            render={<Link href={`/${slug}/booking`} onClick={preventNav} />}
            nativeButton={false}
            variant="dark"
            size="sm"
          >
            Reservar
          </Button>
        </div>
      </nav>

      <header className="relative flex min-h-[560px] items-end overflow-hidden bg-foreground sm:min-h-[640px]">
        {heroPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroPhoto}
            alt={`Espacio de ${business.name}`}
            className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative w-full px-6 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            {location && <p className="kicker-label mb-3 text-primary">{location}</p>}
            <h1 className="type-display mb-4 text-4xl leading-[0.95] text-background sm:text-6xl">{business.name}</h1>
            {(business.description || config.hero_subtitle) && (
              <p className="mb-6 max-w-xl text-lg text-background/85">
                {business.description}
                {config.hero_subtitle ? ` — ${config.hero_subtitle}` : ""}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                render={<Link href={`/${slug}/booking`} onClick={preventNav} />}
                nativeButton={false}
                size="lg"
                className="halo"
              >
                {ctaLabel}
              </Button>
              {showReviews && config.reviews && (
                <Badge variant="outline">
                  {config.reviews.rating.toFixed(1)}/5 · {config.reviews.count} valoraciones
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {showBenefits && config.benefits && config.benefits.length > 0 && (
        <section className="px-6 py-6 sm:px-12">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
            {config.benefits.map((benefit) => (
              <span key={benefit} className="surface kicker-label rounded-full bg-card px-4 py-2 text-foreground">
                {benefit}
              </span>
            ))}
          </div>
        </section>
      )}

      <section id="servicios" className="scroll-mt-20 px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="kicker-label mb-2 text-muted-foreground">Servicios</p>
          <h2 className="type-display mb-8 text-3xl leading-none sm:text-4xl">Qué se puede reservar</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
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
                <CardContent>
                  {service.description && <p className="mb-4 text-sm text-foreground/70">{service.description}</p>}
                  <Button
                    render={<Link href={`/${slug}/booking?service=${service.id}`} onClick={preventNav} />}
                    nativeButton={false}
                    variant="dark"
                    size="sm"
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
        <section className="px-6 py-16 sm:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="kicker-label mb-2 text-muted-foreground">Galería</p>
            <h2 className="type-display mb-8 text-3xl leading-none sm:text-4xl">Trabajos recientes</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-2xl sm:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={galleryPhotos[0]} alt="Trabajo realizado" className="h-full w-full object-cover" />
              </div>
              {galleryPhotos.slice(1).map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Trabajo realizado" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-16">
        <p className="kicker-label mb-4 px-6 text-center text-muted-foreground sm:px-12">
          {business.name}
          {location ? ` · ${location}` : ""}
        </p>
        {showMap && mapSrc && (
          <div className="aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
            <iframe
              src={mapSrc}
              className={cn("h-full w-full border-0", !interactive && "pointer-events-none")}
              loading="lazy"
              title={`Ubicación de ${business.name}`}
            />
          </div>
        )}
      </footer>

      <div className="bg-foreground px-6 py-6 text-background sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
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
