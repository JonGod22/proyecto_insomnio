import { createClient } from "@/lib/supabase/server";
import { LandingBuilderWorkspace } from "@/components/landing-builder-workspace";
import type { Json, LandingConfig } from "@/lib/types";

export default async function LandingBuilderAdminPage() {
  const supabase = await createClient();

  const { data: businessId } = await supabase.rpc("get_my_business_id");
  const [{ data: business }, { data: landing }, { data: services }, { data: platformSettings }] = await Promise.all([
    supabase
      .from("businesses")
      .select("slug, name, description, address, city, whatsapp_number")
      .eq("id", businessId as string)
      .maybeSingle(),
    supabase.from("landing").select("config_json").eq("business_id", businessId as string).maybeSingle(),
    supabase.from("services").select("*").eq("business_id", businessId as string).order("name"),
    supabase.from("platform_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const config = (landing?.config_json ?? {}) as Json as LandingConfig;

  return (
    <div className="space-y-6">
      <h1 className="type-display text-4xl leading-none">Landing Builder</h1>
      {business?.slug ? (
        <LandingBuilderWorkspace
          config={config}
          slug={business.slug}
          business={business}
          services={services ?? []}
          platformSettings={platformSettings ?? undefined}
        />
      ) : (
        <p className="text-sm text-destructive">
          Tu negocio todavía no tiene slug configurado — no se puede mostrar la vista previa.
        </p>
      )}
    </div>
  );
}
