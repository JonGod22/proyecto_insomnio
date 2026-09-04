"use client";

import { useRef, useState } from "react";
import { GripVerticalIcon } from "lucide-react";
import { LandingBuilderForm } from "@/components/landing-builder-form";
import { LandingPreview, type PreviewBusiness } from "@/components/landing-preview";
import { toggleServiceOnLanding } from "@/app/(admin)/admin/services/actions";
import { cn } from "@/lib/utils";
import type { LandingConfig, Service } from "@/lib/types";

const MIN_PREVIEW_PCT = 20;
const MAX_PREVIEW_PCT = 60;

export function LandingBuilderWorkspace({
  config,
  slug,
  business,
  services,
}: {
  config: LandingConfig;
  slug: string;
  business: PreviewBusiness;
  services: Service[];
}) {
  const [previewPct, setPreviewPct] = useState(32);
  const [dragging, setDragging] = useState(false);
  const [liveConfig, setLiveConfig] = useState(config);
  const [servicesState, setServicesState] = useState(services);
  const containerRef = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pctFromRight = ((rect.right - e.clientX) / rect.width) * 100;
    setPreviewPct(Math.min(MAX_PREVIEW_PCT, Math.max(MIN_PREVIEW_PCT, pctFromRight)));
  }

  function startDragging(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function stopDragging(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  }

  function handleToggleService(id: string, value: boolean) {
    setServicesState((prev) => prev.map((s) => (s.id === id ? { ...s, show_on_landing: value } : s)));
    toggleServiceOnLanding(id, value);
  }

  const visibleServices = servicesState.filter((s) => s.active && s.show_on_landing);

  return (
    <div ref={containerRef} className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0">
      <div className="min-w-0 flex-1 lg:pr-4">
        <LandingBuilderForm
          config={config}
          whatsappNumber={business.whatsapp_number}
          services={servicesState}
          onToggleService={handleToggleService}
          onLiveChange={setLiveConfig}
        />
      </div>

      {/* Divisor arrastrable: ajusta el ancho de la vista previa (solo desktop).
          Línea siempre visible para marcar que el sector se puede arrastrar. */}
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
        <span className={cn("absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border", dragging && "bg-primary")} />
        <GripVerticalIcon className="relative size-4 bg-card" />
      </button>

      {/* Vista previa en vivo: mismo componente que renderiza la landing
          pública real, alimentado con el estado del formulario sin guardar
          — cero desfasaje entre lo que se edita y lo que se ve. */}
      <div className="preview-pane shrink-0" style={{ ["--preview-pct" as string]: `${previewPct}%` }}>
        <div className="surface flex h-[70vh] flex-col overflow-hidden bg-card lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]">
          <div className="border-b border-border p-3">
            <p className="kicker-label text-muted-foreground">Vista previa (en vivo, sin guardar todavía)</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <LandingPreview slug={slug} business={business} services={visibleServices} config={liveConfig} interactive={false} />
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
