import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(admin)/login/actions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware ya redirige a /login si no hay user, pero defendemos igual.
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <p>
          Necesitás iniciar sesión.{" "}
          <Link href="/login" className="underline">
            Ir a login
          </Link>
        </p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, business_id, businesses(name, slug)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          Tu cuenta ({user.email}) todavía no está vinculada a ningún negocio. Pedile a quien
          administra Proyecto Insomnio que te asigne a un negocio para poder usar el panel.
        </p>
        <form action={signOut}>
          <Button variant="outline" size="sm" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </main>
    );
  }

  const business = profile.businesses as unknown as { name: string; slug: string } | null;

  return (
    <div className="min-h-screen">
      {/* Banner de tenant activo: contexto de negocio siempre visible. El nombre
          es un link a la landing pública para poder revisarla desde el admin. */}
      <div className="bg-foreground px-6 py-6 text-background sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="kicker-label mb-2 text-primary">Tenant activo</p>
            {business?.slug ? (
              <Link
                href={`/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="type-display inline-block text-3xl leading-none hover:text-primary sm:text-4xl"
              >
                {business.name}
              </Link>
            ) : (
              <h1 className="type-display text-3xl leading-none sm:text-4xl">
                {business?.name ?? "Proyecto Insomnio"}
              </h1>
            )}
            <p className="mt-3 text-xs text-background/60">
              business_id · {profile.business_id.slice(0, 8)} · RLS activo en todas las queries
            </p>
          </div>
          {business?.slug && (
            <Button
              render={<Link href={`/${business.slug}`} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              variant="secondary"
              size="sm"
              className="shrink-0"
            >
              Ver landing
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
        <aside className="surface w-full shrink-0 bg-card p-5 sm:w-56">
          <AdminNav />
          <div className="mt-6 space-y-3 border-t border-border pt-4 sm:mt-8">
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <form action={signOut}>
              <Button variant="secondary" size="sm" type="submit" className="w-full">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
