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
        "relative hidden shrink-0 bg-foreground text-background transition-[width] sm:sticky sm:top-0 sm:flex sm:h-screen",
        collapsed ? "sm:w-16" : "sm:w-1/4 sm:min-w-[240px] sm:max-w-xs"
      )}
    >
      {/* Botón de colapsar: fijo en el borde de la sidebar (mitad afuera,
          mitad adentro), a la altura del título de la página — como la
          sidebar es sticky, el botón siempre está a mano sin importar
          cuánto se haya scrolleado el contenido. Vive fuera del contenedor
          con scroll propio para no generar overflow horizontal (si el
          scroll vertical estuviera en el mismo elemento que este botón
          "sale" del borde, el navegador agrega también una barra
          horizontal). */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        className="surface absolute -right-3.5 top-8 z-10 flex size-7 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-muted"
      >
        {collapsed ? <ChevronRightIcon className="size-3.5" /> : <ChevronLeftIcon className="size-3.5" />}
      </button>

      <div className={cn("flex min-w-0 flex-1 flex-col justify-between overflow-y-auto", collapsed ? "p-4" : "p-8")}>
        <div className="min-w-0">{!collapsed && (<>{header}{nav}</>)}</div>
        {!collapsed && footer}
      </div>
    </aside>
  );
}
