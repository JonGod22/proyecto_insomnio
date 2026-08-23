import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingAgentChat } from "@/components/floating-agent-chat";
import type { Json } from "@/lib/types";

type LandingConfig = {
  hero_subtitle?: string;
  benefits?: string[];
  reviews?: { rating: number; count: number };
};

const STUDIO_PHOTO =
  "https://images.unsplash.com/photo-1695527081848-1e46c06e6458?auto=format&fit=crop&w=1400&q=80";

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

  return (
    <main className="flex-1">
      {/* Nav: marca + accesos rápidos. El agente vive flotando abajo. */}
      <nav className="surface flex items-center justify-between bg-card px-6 py-4 sm:px-12">
        <div className="flex items-center gap-3">
          <span className="size-3 rotate-45 bg-primary" aria-hidden />
          <span className="type-display text-lg leading-none">{business.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button render={<Link href="#servicios" />} nativeButton={false} variant="ghost" size="sm" className="hidden sm:inline-flex">
            Servicios
          </Button>
          <Button render={<Link href={`/${slug}/booking`} />} nativeButton={false} variant="dark" size="sm">
            Reservar
          </Button>
        </div>
      </nav>

      {/* Hero: presentación del negocio. El agente queda accesible como chat flotante. */}
      <header className="px-6 py-16 sm:px-12">
        <div className="mx-auto grid max-w-4xl items-center gap-8 sm:grid-cols-2">
          <div>
            {location && <p className="kicker-label mb-3 text-muted-foreground">{location}</p>}
            <h1 className="type-display mb-4 text-4xl leading-[0.95] sm:text-5xl">{business.name}</h1>
            {(business.description || config.hero_subtitle) && (
              <p className="mb-6 text-lg text-foreground/80">
                {business.description}
                {config.hero_subtitle ? ` — ${config.hero_subtitle}` : ""}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button render={<Link href={`/${slug}/booking`} />} nativeButton={false} variant="dark" size="lg" className="halo">
                Reservar turno
              </Button>
              {config.reviews && (
                <Badge variant="outline">
                  {config.reviews.rating.toFixed(1)}/5 · {config.reviews.count} valoraciones
                </Badge>
              )}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={STUDIO_PHOTO}
              alt={`Espacio de ${business.name}`}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </header>

      {config.benefits && config.benefits.length > 0 && (
        <section className="px-6 py-6 sm:px-12">
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
            {config.benefits.map((benefit) => (
              <span key={benefit} className="surface kicker-label rounded-full bg-card px-4 py-2 text-foreground">
                {benefit}
              </span>
            ))}
          </div>
        </section>
      )}

      <section id="servicios" className="scroll-mt-20 px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="kicker-label mb-2 text-muted-foreground">Servicios</p>
          <h2 className="type-display mb-8 text-3xl leading-none sm:text-4xl">Qué se puede reservar</h2>
          <div className="grid gap-4 sm:grid-cols-2">
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

      <section className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="kicker-label mb-2 text-muted-foreground">Galería</p>
          <h2 className="type-display mb-8 text-3xl leading-none sm:text-4xl">Trabajos recientes</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-2xl sm:aspect-auto">
              <Image
                src={GALLERY_PHOTOS[0]}
                alt="Trabajo realizado"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            {GALLERY_PHOTOS.slice(1).map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src={src} alt="Trabajo realizado" fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="kicker-label mb-4 text-center text-muted-foreground">
            {business.name}
            {location ? ` · ${location}` : ""}
          </p>
          {location && (
            <div className="surface aspect-[16/7] overflow-hidden rounded-2xl">
              <iframe
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
                title={`Ubicación de ${business.name}`}
              />
            </div>
          )}
        </div>
      </footer>

      <FloatingAgentChat slug={slug} businessName={business.name} />
    </main>
  );
}
