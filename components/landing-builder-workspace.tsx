"use client";

import { useRef, useState } from "react";
import { RefreshCwIcon, GripVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingBuilderForm } from "@/components/landing-builder-form";
import { cn } from "@/lib/utils";
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
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewUrl = `/${slug}`;

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pctFromRight = ((rect.right - e.clientX) / rect.width) * 100;
    setPreviewPct(Math.min(MAX_PREVIEW_PCT, Math.max(MIN_PREVIEW_PCT, pctFromRight)));
  }

  function startDragging(e: React.PointerEvent<HTMLButtonElement>) {
    // setPointerCapture ata todos los eventos siguientes a este botón, aunque
    // el mouse pase por arriba del iframe de la vista previa (que si no,
    // "roba" los eventos de mouse y corta el arrastre a mitad de camino).
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function stopDragging(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0">
      <div className="min-w-0 flex-1 lg:pr-4">
        <LandingBuilderForm config={config} business={business} onSaved={() => setReloadKey((k) => k + 1)} />
      </div>

      {/* Divisor arrastrable: ajusta el ancho de la vista previa (solo desktop).
          La línea queda siempre visible, no solo al pasar el mouse, para que
          se note que ese sector se puede arrastrar. */}
      <button
        type="button"
        onPointerDown={startDragging}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        aria-label="Arrastrar para cambiar el tamaño de la vista previa"
        className={cn(
          "relative hidden shrink-0 cursor-col-resize items-center justify-center px-2 text-muted-foreground hover:text-foreground lg:flex",
          dragging && "text-foreground"
        )}
      >
        <span
          className={cn(
            "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border",
            dragging && "bg-primary"
          )}
        />
        <GripVerticalIcon className="relative size-4 bg-card" />
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
          <div className="relative min-h-0 flex-1">
            <iframe key={reloadKey} src={previewUrl} title="Vista previa de la landing" className="size-full" />
            {/* Mientras se arrastra, un overlay transparente evita que el
                iframe capture el mouse y corte el resize. */}
            {dragging && <div className="absolute inset-0" />}
          </div>
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
