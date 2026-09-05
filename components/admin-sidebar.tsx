"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  header,
  nav,
  footer,
}: {
  header: React.ReactNode;
  nav: React.ReactNode;
  footer: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 flex-col justify-between overflow-y-auto bg-foreground text-background transition-[width] sm:sticky sm:top-0 sm:flex sm:h-screen",
        collapsed ? "sm:w-16 sm:p-4" : "sm:w-1/4 sm:min-w-[240px] sm:max-w-xs sm:p-8"
      )}
    >
      {/* Botón de colapsar: fijo en el borde de la sidebar (mitad afuera,
          mitad adentro), a la altura del título de la página — como la
          sidebar es sticky, el botón siempre está a mano sin importar
          cuánto se haya scrolleado el contenido. */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        className="surface absolute -right-3.5 top-8 z-10 flex size-7 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-muted"
      >
        {collapsed ? <ChevronRightIcon className="size-3.5" /> : <ChevronLeftIcon className="size-3.5" />}
      </button>

      <div className="min-w-0">{!collapsed && (<>{header}{nav}</>)}</div>
      {!collapsed && footer}
    </aside>
  );
}
