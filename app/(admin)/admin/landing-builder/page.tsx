import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LandingBuilderWorkspace } from "@/components/landing-builder-workspace";
import type { Json, LandingConfig } from "@/lib/types";

export default async function LandingBuilderAdminPage() {
  const supabase = await createClient();

  const { data: businessId } = await supabase.rpc("get_my_business_id");
  const [{ data: business }, { data: landing }, { data: services }] = await Promise.all([
    supabase
      .from("businesses")
      .select("slug, name, description, address, city, whatsapp_number")
      .eq("id", businessId as string)
      .maybeSingle(),
    supabase.from("landing").select("config_json").eq("business_id", businessId as string).maybeSingle(),
    supabase.from("services").select("*").eq("business_id", businessId as string).order("name"),
  ]);

  const config = (landing?.config_json ?? {}) as Json as LandingConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="type-display text-4xl leading-none">Landing Builder</h1>
        {business?.slug && (
          <Link
            href={`/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="kicker-label text-foreground underline"
          >
            Abrir landing pública
          </Link>
        )}
      </div>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Cada bloque de acá abajo es una sección de la landing pública. La vista previa de la
        derecha se actualiza al instante con el mismo componente que usa la página real —
        &quot;Guardar cambios&quot; es lo que lo deja publicado de verdad.
      </p>
      {business?.slug ? (
        <LandingBuilderWorkspace config={config} slug={business.slug} business={business} services={services ?? []} />
      ) : (
        <p className="text-sm text-destructive">
          Tu negocio todavía no tiene slug configurado — no se puede mostrar la vista previa.
        </p>
      )}
    </div>
  );
}
