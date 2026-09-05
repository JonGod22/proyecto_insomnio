import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(admin)/login/actions";
import { Button } from "@/components/ui/button";
import { AdminSidebarNav, AdminMobileNav } from "@/components/admin-nav";
import { AdminSidebar } from "@/components/admin-sidebar";

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
    .select("full_name, role, business_id, is_superadmin, businesses(name, slug)")
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

  const tenantHeader = business?.slug ? (
    <Link
      href={`/${business.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="type-display inline-block text-3xl leading-none hover:text-primary sm:text-4xl"
    >
      {business.name}
    </Link>
  ) : (
    <h1 className="type-display text-3xl leading-none sm:text-4xl">{business?.name ?? "Proyecto Insomnio"}</h1>
  );

  // Placeholder para cuando existan planes pagos — hoy todos los negocios
  // están en el mismo nivel, no hay lógica de suscripción todavía.
  const planBadge = (
    <span className="kicker-label inline-block rounded-full bg-background/10 px-3 py-1 text-background/70">
      Plan Free
    </span>
  );

  return (
    <div className="min-h-screen sm:flex">
      {/* Sidebar fija de desktop: cuarto del ancho, colapsable con la
          flechita. En mobile no se renderiza (hidden). */}
      <AdminSidebar
        header={
          <>
            {tenantHeader}
            <div className="mt-3">{planBadge}</div>
          </>
        }
        nav={<AdminSidebarNav />}
        footer={
          <div className="space-y-3 border-t border-background/10 pt-4">
            {profile.is_superadmin && (
              <Link
                href="/superadmin"
                className="kicker-label block text-background/70 hover:text-background"
              >
                Editor interno ↗
              </Link>
            )}
            <p className="truncate text-xs text-background/60">{user.email}</p>
            <form action={signOut}>
              <Button variant="secondary" size="sm" type="submit" className="w-full">
                Cerrar sesión
              </Button>
            </form>
          </div>
        }
      />

      <div className="min-w-0 flex-1">
        {/* Header de mobile: mismo banner de tenant + menú hamburguesa reducido. */}
        <div className="bg-foreground px-6 py-6 text-background sm:hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              {tenantHeader}
              <div className="mt-3">{planBadge}</div>
            </div>
            <AdminMobileNav userEmail={user.email ?? ""} signOutAction={signOut} />
          </div>
        </div>

        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
