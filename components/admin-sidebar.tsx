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
        "hidden shrink-0 flex-col justify-between bg-foreground text-background transition-[width] sm:flex",
        collapsed ? "sm:w-16 sm:p-4" : "sm:w-1/4 sm:min-w-[240px] sm:max-w-xs sm:p-8"
      )}
    >
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="mb-4 flex size-9 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
        >
          {collapsed ? <ChevronRightIcon className="size-4" /> : <ChevronLeftIcon className="size-4" />}
        </button>
        {!collapsed && (
          <>
            {header}
            {nav}
          </>
        )}
      </div>
      {!collapsed && footer}
    </aside>
  );
}
