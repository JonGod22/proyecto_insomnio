import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingAgentChat } from "@/components/floating-agent-chat";
import { LandingPreview } from "@/components/landing-preview";
import type { Json, LandingConfig } from "@/lib/types";

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
      .select(
        "id, name, description, price, price_on_request, deposit_amount, duration_minutes, duration_minutes_max, info_content, info_images"
      )
      .eq("business_id", business.id)
      .eq("active", true)
      .eq("show_on_landing", true),
    supabase.from("landing").select("config_json").eq("business_id", business.id).maybeSingle(),
  ]);

  const config = (landing?.config_json ?? {}) as Json as LandingConfig;

  return (
    <>
      <LandingPreview slug={slug} business={business} services={services ?? []} config={config} interactive />
      <FloatingAgentChat slug={slug} businessName={business.name} />
    </>
  );
}
