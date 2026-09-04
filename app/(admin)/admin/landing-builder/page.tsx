import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LandingBuilderWorkspace } from "@/components/landing-builder-workspace";
import type { Json, LandingConfig } from "@/lib/types";

export default async function LandingBuilderAdminPage() {
  const supabase = await createClient();

  const { data: businessId } = await supabase.rpc("get_my_business_id");
  const [{ data: business }, { data: landing }, { data: services }] = await Promise.all([
    supabase.from("businesses").select("slug, name, description, address, city").eq("id", businessId as string).maybeSingle(),
    supabase.from("landing").select("config_json").eq("business_id", businessId as string).maybeSingle(),
    supabase
      .from("services")
      .select("id, name, description, price, price_on_request, deposit_amount, duration_minutes, duration_minutes_max")
      .eq("business_id", businessId as string)
      .eq("active", true),
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
        Cada bloque de acá abajo es una sección de la landing pública. Prendé o apagá lo que
        quieras mostrar y editá su contenido — la vista previa de la derecha se actualiza al
        instante, con el mismo componente que usa la página real. Guardar la deja publicada.
      </p>
      {business?.slug ? (
        <LandingBuilderWorkspace
          config={config}
          slug={business.slug}
          business={{
            name: business.name,
            description: business.description,
            address: business.address,
            city: business.city,
          }}
          services={services ?? []}
        />
      ) : (
        <p className="text-sm text-destructive">
          Tu negocio todavía no tiene slug configurado — no se puede mostrar la vista previa.
        </p>
      )}
    </div>
  );
}
