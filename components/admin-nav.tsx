"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_DESKTOP = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/appointments", label: "Turnos" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/services", label: "Servicios" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/knowledge", label: "Base de conocimiento" },
  { href: "/admin/landing-builder", label: "Landing Builder" },
];

// En mobile el menú se reduce a los módulos de uso diario — Servicios y
// Landing Builder quedan solo para desktop por ahora (pedido de Jonathan).
const NAV_MOBILE = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/appointments", label: "Turnos" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/knowledge", label: "Base de conocimiento" },
];

// "/admin" es el home: startsWith lo marcaría activo en cualquier ruta,
// así que necesita coincidencia exacta; el resto de módulos sigue con prefijo.
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavLink({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "kicker-label rounded-[10px] px-3 py-2.5 transition-colors",
        active ? "bg-primary text-foreground" : "text-background/80 hover:bg-background/10 hover:text-background"
      )}
    >
      {label}
    </Link>
  );
}

/** Sidebar fija de desktop: vive dentro del panel lateral, siempre visible. */
export function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-8 flex flex-col gap-1">
      {NAV_DESKTOP.map((item) => (
        <NavLink key={item.href} href={item.href} label={item.label} active={isActive(pathname, item.href)} />
      ))}
    </nav>
  );
}

/** Menú hamburguesa de mobile: lista reducida, colapsado por defecto. */
export function AdminMobileNav({
  userEmail,
  signOutAction,
}: {
  userEmail: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú de módulos"}
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
      >
        {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="surface absolute right-0 top-14 z-50 w-64 max-w-[calc(100vw-3rem)] rounded-[20px] bg-card p-3 text-foreground">
            <p className="kicker-label mb-2 px-2 text-muted-foreground">Módulos</p>
            <nav className="flex flex-col gap-1">
              {NAV_MOBILE.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "kicker-label rounded-[10px] px-3 py-2.5 transition-colors",
                      active ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <p className="truncate px-2 text-xs text-muted-foreground">{userEmail}</p>
              <form action={signOutAction}>
                <Button variant="secondary" size="sm" type="submit" className="w-full">
                  Cerrar sesión
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
