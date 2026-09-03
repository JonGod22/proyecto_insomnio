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
          <AdminNav userEmail={user.email ?? ""} signOutAction={signOut} />
        </div>
      </div>

      <div className="min-w-0 p-6 sm:p-8">{children}</div>
    </div>
  );
}
