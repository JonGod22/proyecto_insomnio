import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/booking-form";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { slug } = await params;
  const { service: preselectedServiceId } = await searchParams;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes")
    .eq("business_id", business.id)
    .eq("active", true);

  return (
    <main className="flex-1 px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-md">
        <p className="kicker-label mb-2 text-muted-foreground">Reservar turno</p>
        <h1 className="type-display mb-8 text-4xl leading-none">{business.name}</h1>
        <BookingForm
          businessId={business.id}
          services={services ?? []}
          initialServiceId={preselectedServiceId}
        />
      </div>
    </main>
  );
}
