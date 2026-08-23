"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
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
  );
}
