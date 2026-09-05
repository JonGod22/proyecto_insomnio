import { createClient } from "@/lib/supabase/server";
import { PlatformSettingsForm } from "@/components/platform-settings-form";

export default async function SuperadminPage() {
  const supabase = await createClient();

  const [{ data: settings }, { data: businesses }] = await Promise.all([
    supabase.from("platform_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("businesses").select("slug, name, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Esto edita la plantilla base compartida por todas las landings (créditos del pie y copy
          del agente) — separado del Landing Builder, que edita el diseño de UN negocio a la vez.
        </p>
      </div>

      {settings ? (
        <PlatformSettingsForm settings={settings} />
      ) : (
        <p className="text-sm text-destructive">
          No se encontró la fila de configuración de la plantilla base. Revisá la migración
          0012_superadmin_platform_settings.
        </p>
      )}

      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">Negocios en la plataforma</p>
        <div className="divide-y divide-border">
          {(businesses ?? []).map((b) => (
            <div key={b.slug} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm">{b.name}</span>
              <a
                href={`/${b.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="kicker-label text-muted-foreground hover:text-primary"
              >
                Ver landing ↗
              </a>
            </div>
          ))}
          {(businesses ?? []).length === 0 && (
            <p className="py-2.5 text-sm text-muted-foreground">Todavía no hay negocios cargados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
