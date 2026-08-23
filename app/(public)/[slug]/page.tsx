import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatWidget } from "@/components/chat-widget";
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
  if (service.price_on_request || service.price === null) return "Precio a consultar";
  const price = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(service.price);
  if (!service.deposit_amount) return price;
  const deposit = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(service.deposit_amount);
  return `${price} · seña ${deposit}`;
}

function formatDuration(min: number, max: number | null) {
  if (max && max !== min) return `${min}-${max} min`;
  return `~${min} min`;
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{business.name}</h1>
        {business.description && (
          <p className="mt-2 text-muted-foreground">{business.description}</p>
        )}
        {config.hero_subtitle && <p className="mt-1 text-sm">{config.hero_subtitle}</p>}
        {(business.address || business.city) && (
          <p className="mt-2 text-sm text-muted-foreground">
            {[business.address, business.city].filter(Boolean).join(", ")}
          </p>
        )}
        {config.reviews && (
          <Badge variant="secondary" className="mt-3">
            {config.reviews.rating.toFixed(1)}/5 · {config.reviews.count} valoraciones
          </Badge>
        )}
        <div className="mt-6">
          <Button render={<Link href={`/${slug}/booking`} />} nativeButton={false} size="lg">
            Reservar turno
          </Button>
        </div>
      </header>

      {config.benefits && config.benefits.length > 0 && (
        <ul className="mb-10 grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
          {config.benefits.map((benefit) => (
            <li key={benefit} className="rounded-md border p-2 text-center">
              {benefit}
            </li>
          ))}
        </ul>
      )}

      <section className="grid gap-4">
        {services?.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{service.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {formatDuration(service.duration_minutes, service.duration_minutes_max)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {service.description && (
                <p className="mb-2 text-sm text-muted-foreground">{service.description}</p>
              )}
              <p className="font-medium">{formatPrice(service)}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <ChatWidget slug={slug} businessName={business.name} />
    </main>
  );
}
