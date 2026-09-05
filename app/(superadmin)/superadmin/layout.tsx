import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(admin)/login/actions";
import { Button } from "@/components/ui/button";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    .select("is_superadmin")
    .eq("id", user.id)
    .maybeSingle();

  // Este panel edita la plantilla base compartida por todos los negocios,
  // no el landing de uno solo — separado a propósito del Landing Builder
  // tenant y con su propio flag (no `role`, que es owner/staff DENTRO de
  // un negocio) para que un dueño de negocio nunca pueda tocarlo.
  if (!profile?.is_superadmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          Esta sección es solo para el administrador de la plataforma. Tu cuenta ({user.email}) no
          tiene ese permiso.
        </p>
        <Link href="/admin" className="underline">
          Volver al panel de tu negocio
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-foreground px-6 py-6 text-background sm:px-10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="kicker-label text-background/60">Proyecto Insomnio</p>
            <h1 className="type-display text-2xl leading-none sm:text-3xl">Editor interno</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="kicker-label text-background/70 hover:text-background">
              Ir a mi panel de negocio
            </Link>
            <form action={signOut}>
              <Button variant="secondary" size="sm" type="submit">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl p-6 sm:p-8">{children}</div>
    </div>
  );
}
