"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLinkIcon, GripVerticalIcon, MonitorIcon, TabletIcon, SmartphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingBuilderForm } from "@/components/landing-builder-form";
import { LandingPreview, type PreviewBusiness, type PlatformSettings } from "@/components/landing-preview";
import { DeviceFrame, DEVICE_SPECS, type DeviceId } from "@/components/device-frame";
import { updateLandingConfig, type LandingFormState } from "@/app/(admin)/admin/landing-builder/actions";
import { toggleServiceOnLanding } from "@/app/(admin)/admin/services/actions";
import { cn } from "@/lib/utils";
import type { LandingConfig, Service } from "@/lib/types";

const MIN_PREVIEW_PCT = 30;
const MAX_PREVIEW_PCT = 70;
const FORM_ID = "landing-builder-form";
const initialState: LandingFormState = { error: null };

const DEVICE_OPTIONS: { id: DeviceId; icon: typeof MonitorIcon }[] = [
  { id: "desktop", icon: MonitorIcon },
  { id: "tablet", icon: TabletIcon },
  { id: "mobile", icon: SmartphoneIcon },
];

export function LandingBuilderWorkspace({
  config,
  slug,
  business,
  services,
  platformSettings,
}: {
  config: LandingConfig;
  slug: string;
  business: PreviewBusiness;
  services: Service[];
  platformSettings?: PlatformSettings;
}) {
  const [state, formAction, pending] = useActionState(updateLandingConfig, initialState);
  const [previewPct, setPreviewPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [liveConfig, setLiveConfig] = useState(config);
  const [servicesState, setServicesState] = useState(services);
  const [device, setDevice] = useState<DeviceId>("desktop");
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
          formId={FORM_ID}
          formAction={formAction}
          error={state.error}
          config={config}
          whatsappNumber={business.whatsapp_number}
          services={servicesState}
          onToggleService={handleToggleService}
          onLiveChange={setLiveConfig}
        />
      </div>

      {/* Divisor arrastrable: ajusta el ancho de la vista previa (solo desktop). */}
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
          — cero desfasaje entre lo que se edita y lo que se ve. Siempre
          flotante (sticky) mientras se scrollea el formulario, para no
          perder de vista lo que se está editando. Los botones Computadora/
          Tablet/Celular renderizan el tamaño real de cada dispositivo (no
          solo el ancho del panel) para que los breakpoints @container
          respondan igual que en la pantalla real de cada uno — la altura
          se ajusta también, así el mockup completo entra siempre sin tener
          que scrollear el bloque para verlo entero. */}
      <div className="preview-pane shrink-0" style={{ ["--preview-pct" as string]: `${previewPct}%` }}>
        <div className="surface flex h-[75vh] flex-col overflow-hidden bg-card lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <Button type="submit" form={FORM_ID} disabled={pending} className="flex-1">
              {pending ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button
              render={<Link href={`/${slug}`} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              variant="outline"
              className="flex-1 gap-1.5"
            >
              Abrir landing pública
              <ExternalLinkIcon className="size-3.5" />
            </Button>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-1 border-b border-border p-2">
            {DEVICE_OPTIONS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDevice(id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-sm",
                  device === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4" />
                {DEVICE_SPECS[id].label}
              </button>
            ))}
          </div>

          {!pending && !state.error && state !== initialState && (
            <p className="kicker-label shrink-0 border-b border-border px-3 py-2 text-muted-foreground">Guardado.</p>
          )}

          <div className="min-h-0 flex-1 bg-muted/40">
            <DeviceFrame device={device}>
              <LandingPreview
                slug={slug}
                business={business}
                services={visibleServices}
                config={liveConfig}
                interactive={false}
                platformSettings={platformSettings}
              />
            </DeviceFrame>
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
            min-width: 320px;
          }
        }
      `}</style>
    </div>
  );
}
