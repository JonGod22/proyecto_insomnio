import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(admin)/login/actions";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin/appointments", label: "Turnos" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/services", label: "Servicios" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/knowledge", label: "Base de conocimiento" },
  { href: "/admin/landing-builder", label: "Landing" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware ya redirige a /login si no hay user, pero defendemos igual.
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <p>Necesitás iniciar sesión. <Link href="/login" className="underline">Ir a login</Link></p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, business_id, businesses(name)")
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

  const businessName = (profile.businesses as unknown as { name: string } | null)?.name;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col justify-between border-r p-4">
        <div>
          <p className="mb-1 font-semibold">{businessName ?? "Proyecto Insomnio"}</p>
          <p className="mb-4 text-xs text-muted-foreground">{user.email}</p>
          <nav className="flex flex-col gap-1 text-sm">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded px-2 py-1.5 hover:bg-muted">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
            Cerrar sesión
          </Button>
        </form>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
