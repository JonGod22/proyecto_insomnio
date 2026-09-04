"use client";

import { useState } from "react";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingBuilderForm } from "@/components/landing-builder-form";
import type { LandingConfig } from "@/lib/types";

export function LandingBuilderWorkspace({ config, slug }: { config: LandingConfig; slug: string }) {
  const [reloadKey, setReloadKey] = useState(0);
  const previewUrl = `/${slug}`;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <LandingBuilderForm config={config} onSaved={() => setReloadKey((k) => k + 1)} />
      </div>

      {/* Vista previa en vivo: mismo diseño que la landing pública, se
          recarga sola después de guardar cambios. */}
      <div className="lg:w-1/4 lg:min-w-[320px]">
        <div className="surface sticky top-6 flex h-[70vh] flex-col overflow-hidden bg-card lg:h-[calc(100vh-6rem)]">
          <div className="flex items-center justify-between border-b border-border p-3">
            <p className="kicker-label text-muted-foreground">Vista previa</p>
            <Button variant="ghost" size="sm" onClick={() => setReloadKey((k) => k + 1)} className="gap-1.5">
              <RefreshCwIcon className="size-3.5" />
              Actualizar
            </Button>
          </div>
          <iframe key={reloadKey} src={previewUrl} title="Vista previa de la landing" className="min-h-0 flex-1" />
        </div>
      </div>
    </div>
  );
}
