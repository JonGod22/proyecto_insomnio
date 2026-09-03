"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/appointments", label: "Turnos" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/services", label: "Servicios" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/knowledge", label: "Base de conocimiento" },
  { href: "/admin/landing-builder", label: "Landing Builder" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeItem = NAV.find((item) => pathname.startsWith(item.href));

  return (
    <div>
      {/* En mobile el menú de módulos arranca colapsado para no ocupar toda
          la pantalla arriba del contenido; en desktop siempre está abierto. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="kicker-label mb-3 flex w-full items-center justify-between text-muted-foreground sm:pointer-events-none sm:mb-3"
      >
        <span>Módulos{activeItem ? ` · ${activeItem.label}` : ""}</span>
        <span className="sm:hidden">
          {open ? <ChevronDownIcon className="size-4" /> : <MenuIcon className="size-4" />}
        </span>
      </button>
      <nav className={cn("flex-col gap-1 sm:flex", open ? "flex" : "hidden")}>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "kicker-label px-3 py-2.5 transition-colors",
                active ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
