"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin/appointments", label: "Turnos" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/services", label: "Servicios" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/knowledge", label: "Base de conocimiento" },
  { href: "/admin/landing-builder", label: "Landing Builder" },
];

export function AdminNav({
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
          {/* Backdrop: cierra el menú al tocar afuera. */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="surface absolute right-0 top-14 z-50 w-64 max-w-[calc(100vw-3rem)] rounded-[20px] bg-card p-3 text-foreground">
            <p className="kicker-label mb-2 px-2 text-muted-foreground">Módulos</p>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
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
