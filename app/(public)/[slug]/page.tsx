import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatWidget } from "@/components/chat-widget";
import { OpenChatButton } from "@/components/open-chat-button";
import type { Json } from "@/lib/types";

type LandingConfig = {
  hero_subtitle?: string;
  benefits?: string[];
  reviews?: { rating: number; count: number };
};

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

  return (
    <main className="flex-1">
      {/* Nav: marca (rombo) + acciones principales, siempre visible arriba del contenido. */}
      <nav className="flex items-center justify-between border-b-2 border-foreground bg-card px-6 py-4 sm:px-12">
        <div className="flex items-center gap-3">
          <span className="size-3 rotate-45 bg-primary" aria-hidden />
          <span className="type-display text-lg leading-none">{business.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button render={<Link href={`/${slug}/booking`} />} nativeButton={false} variant="dark" size="sm">
            Reservar
          </Button>
          <OpenChatButton className="h-8 px-3 text-xs">Hablar con agente</OpenChatButton>
        </div>
      </nav>

      {/* Hero: placa única con placeholder de foto de fondo, un acento y aire generoso. */}
      <header className="image-placeholder relative overflow-hidden border-b-2 border-foreground px-6 pt-16 pb-6 sm:px-12">
        <div className="mx-auto max-w-3xl">
          {location && <p className="kicker-label mb-4 text-muted-foreground">{location}</p>}
          <h1 className="type-display text-[13vw] leading-[0.9] sm:text-6xl md:text-7xl">
            {business.name}
          </h1>
          {(business.description || config.hero_subtitle) && (
            <p className="mt-6 max-w-xl text-lg text-foreground/80">
              {business.description}
              {config.hero_subtitle ? ` — ${config.hero_subtitle}` : ""}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button render={<Link href={`/${slug}/booking`} />} nativeButton={false} variant="dark" size="lg" className="h-12 px-6 text-base">
              Reservar turno
            </Button>
            <OpenChatButton className="h-12 px-6 text-base">Hablar con agente</OpenChatButton>
            {config.reviews && (
              <Badge variant="outline" className="h-8 border-foreground bg-card px-3 text-xs">
                {config.reviews.rating.toFixed(1)}/5 · {config.reviews.count} valoraciones
              </Badge>
            )}
          </div>
        </div>
        <p className="image-placeholder-label absolute right-4 bottom-4">foto del estudio</p>
      </header>

      {config.benefits && config.benefits.length > 0 && (
        <section className="border-b-2 border-foreground px-6 py-6 sm:px-12">
          <div className="mx-auto flex max-w-3xl flex-wrap gap-3">
            {config.benefits.map((benefit) => (
              <span
                key={benefit}
                className="kicker-label border-2 border-foreground bg-card px-3 py-2 text-foreground"
              >
                {benefit}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="border-b-2 border-foreground px-6 py-16 sm:px-12">
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
            <div className="image-placeholder col-span-2 row-span-2 flex aspect-square items-end justify-start border-2 border-foreground p-2 sm:aspect-auto">
              <span className="image-placeholder-label">foto</span>
            </div>
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="image-placeholder flex aspect-square items-end justify-start border-2 border-foreground p-2"
              >
                <span className="image-placeholder-label">foto</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-foreground px-6 py-8 sm:px-12">
        <p className="kicker-label text-center text-muted-foreground">
          {business.name}
          {location ? ` · ${location}` : ""}
        </p>
      </footer>

      <ChatWidget slug={slug} businessName={business.name} />
    </main>
  );
}
