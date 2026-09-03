import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingAgentChat } from "@/components/floating-agent-chat";
import type { Json, LandingConfig } from "@/lib/types";

const STUDIO_PHOTO =
  "https://images.unsplash.com/photo-1695527081848-1e46c06e6458?auto=format&fit=crop&w=1920&q=80";

const GALLERY_PHOTOS = [
  "https://images.unsplash.com/photo-1735151226446-1d364b4adc2f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1581003250898-36050e78fcd3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1567629307995-b9f33097bd30?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492618269284-653dce58fd6d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1626383137804-ff908d2753a2?auto=format&fit=crop&w=800&q=80",
];

function formatPrice(service: {
  price: number | null;
  price_on_request: boolean;
  deposit_amount: number | null;
}) {
  if (service.price_on_request || service.price === null) return "A consultar";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(service.price);
}

function formatDuration(min: number, max: number | null) {
  if (max && max !== min) return `${min}-${max} min`;
  return `${min} min`;
}

export default async function BusinessLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, description, address, city, whatsapp_number")
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  const [{ data: services }, { data: landing }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, description, price, price_on_request, deposit_amount, duration_minutes, duration_minutes_max")
      .eq("business_id", business.id)
      .eq("active", true),
    supabase.from("landing").select("config_json").eq("business_id", business.id).maybeSingle(),
  ]);

  const config = (landing?.config_json ?? {}) as Json as LandingConfig;
  const location = [business.address, business.city].filter(Boolean).join(", ");
  const mapQuery = encodeURIComponent(location || business.name);
  const heroPhoto = config.hero_image_url || STUDIO_PHOTO;
  const galleryPhotos = config.gallery?.length ? config.gallery : GALLERY_PHOTOS;
  // Bloques prendidos/apagados por defecto: si el negocio nunca tocó el
  // Landing Builder, config.sections viene undefined y todo se muestra.
  const showBenefits = config.sections?.benefits ?? true;
  const showGallery = config.sections?.gallery ?? true;
  const showReviews = config.sections?.reviews ?? true;
  const showMap = config.sections?.map ?? true;

  return (
    <main className="flex-1">
      {/* Nav: marca + accesos rápidos. El agente vive flotando abajo. */}
      <nav className="surface flex items-center justify-between bg-card px-6 py-4 sm:px-12">
        <span className="type-display text-lg leading-none">{business.name}</span>
        <div className="flex items-center gap-3">
          <Button render={<Link href="#servicios" />} nativeButton={false} variant="ghost" size="sm" className="hidden sm:inline-flex">
            Servicios
          </Button>
          <Button render={<Link href={`/${slug}/booking`} />} nativeButton={false} variant="dark" size="sm">
            Reservar
          </Button>
        </div>
      </nav>

      {/* Hero: foto de fondo a todo el ancho, con degradé para legibilidad del texto. */}
      <header className="relative flex min-h-[560px] items-end overflow-hidden sm:min-h-[640px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- el dueño del
            negocio puede pegar cualquier URL desde el Landing Builder, no
            solo dominios pre-aprobados en next.config para next/image. */}
        <img
          src={heroPhoto}
          alt={`Espacio de ${business.name}`}
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative w-full px-6 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            {location && <p className="kicker-label mb-3 text-primary">{location}</p>}
            <h1 className="type-display mb-4 text-4xl leading-[0.95] text-background sm:text-6xl">
              {business.name}
            </h1>
            {(business.description || config.hero_subtitle) && (
              <p className="mb-6 max-w-xl text-lg text-background/85">
                {business.description}
                {config.hero_subtitle ? ` — ${config.hero_subtitle}` : ""}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button render={<Link href={`/${slug}/booking`} />} nativeButton={false} size="lg" className="halo">
                Reservar turno
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
            {services?.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline">{formatDuration(service.duration_minutes, service.duration_minutes_max)}</Badge>
                    <Badge>{formatPrice(service)}</Badge>
                    {service.deposit_amount && (
                      <Badge variant="secondary">seña {formatPrice({ ...service, price: service.deposit_amount, price_on_request: false })}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {service.description && (
                    <p className="mb-4 text-sm text-foreground/70">{service.description}</p>
                  )}
                  <Button
                    render={<Link href={`/${slug}/booking?service=${service.id}`} />}
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
        {showMap && location && (
          <div className="aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
            <iframe
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              title={`Ubicación de ${business.name}`}
            />
          </div>
        )}
      </footer>

      {/* Barra inferior: crédito del desarrollador + contacto/redes. Publicitaria, no del negocio. */}
      <div className="bg-foreground px-6 py-6 text-background sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="kicker-label text-background/60">Sitio desarrollado por Jonathan Godoy</p>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/JonGod22"
              target="_blank"
              rel="noopener noreferrer"
              className="kicker-label text-background hover:text-primary"
            >
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
            <a
              href="https://wa.me/5492634659520"
              target="_blank"
              rel="noopener noreferrer"
              className="kicker-label text-background hover:text-primary"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <FloatingAgentChat slug={slug} businessName={business.name} />
    </main>
  );
}
