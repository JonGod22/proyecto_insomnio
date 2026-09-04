"use client";

import { useCallback, useRef, useState } from "react";
import { RefreshCwIcon, GripVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingBuilderForm } from "@/components/landing-builder-form";
import type { LandingConfig } from "@/lib/types";

const MIN_PREVIEW_PCT = 20;
const MAX_PREVIEW_PCT = 60;

export function LandingBuilderWorkspace({
  config,
  slug,
  business,
}: {
  config: LandingConfig;
  slug: string;
  business: { name: string; address: string | null; city: string | null };
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const [previewPct, setPreviewPct] = useState(28);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const previewUrl = `/${slug}`;

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pctFromRight = ((rect.right - e.clientX) / rect.width) * 100;
    setPreviewPct(Math.min(MAX_PREVIEW_PCT, Math.max(MIN_PREVIEW_PCT, pctFromRight)));
  }, []);

  const stopDragging = useCallback(() => {
    dragging.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDragging);
  }, [onPointerMove]);

  function startDragging() {
    dragging.current = true;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0">
      <div className="min-w-0 flex-1 lg:pr-4">
        <LandingBuilderForm config={config} business={business} onSaved={() => setReloadKey((k) => k + 1)} />
      </div>

      {/* Divisor arrastrable: ajusta el ancho de la vista previa (solo desktop). */}
      <button
        type="button"
        onPointerDown={startDragging}
        aria-label="Arrastrar para cambiar el tamaño de la vista previa"
        className="hidden shrink-0 cursor-col-resize items-center justify-center px-1 text-muted-foreground hover:text-foreground lg:flex"
      >
        <GripVerticalIcon className="size-4" />
      </button>

      {/* Vista previa en vivo: mismo diseño que la landing pública, se
          recarga sola después de guardar cambios. */}
      <div className="preview-pane shrink-0" style={{ ["--preview-pct" as string]: `${previewPct}%` }}>
        <div className="surface flex h-[70vh] flex-col overflow-hidden bg-card lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]">
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

      <style jsx>{`
        .preview-pane {
          width: 100%;
          min-width: 0;
        }
        @media (min-width: 1024px) {
          .preview-pane {
            width: var(--preview-pct);
            min-width: 280px;
          }
        }
      `}</style>
    </div>
  );
}
