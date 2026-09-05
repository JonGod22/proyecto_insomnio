"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ExternalLinkIcon, MonitorIcon, TabletIcon, SmartphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingBuilderForm } from "@/components/landing-builder-form";
import { LandingPreview, type PreviewBusiness } from "@/components/landing-preview";
import { DeviceFrame, DEVICE_SPECS, type DeviceId } from "@/components/device-frame";
import { updateLandingConfig, type LandingFormState } from "@/app/(admin)/admin/landing-builder/actions";
import { toggleServiceOnLanding } from "@/app/(admin)/admin/services/actions";
import { cn } from "@/lib/utils";
import type { LandingConfig, Service } from "@/lib/types";

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
}: {
  config: LandingConfig;
  slug: string;
  business: PreviewBusiness;
  services: Service[];
}) {
  const [state, formAction, pending] = useActionState(updateLandingConfig, initialState);
  const [liveConfig, setLiveConfig] = useState(config);
  const [servicesState, setServicesState] = useState(services);
  const [device, setDevice] = useState<DeviceId>("desktop");

  function handleToggleService(id: string, value: boolean) {
    setServicesState((prev) => prev.map((s) => (s.id === id ? { ...s, show_on_landing: value } : s)));
    toggleServiceOnLanding(id, value);
  }

  const visibleServices = servicesState.filter((s) => s.active && s.show_on_landing);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 lg:w-[420px] lg:shrink-0">
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

      {/* Vista previa en vivo: mismo componente que renderiza la landing
          pública real, alimentado con el estado del formulario sin guardar
          — cero desfasaje entre lo que se edita y lo que se ve. Los botones
          Computadora/Tablet/Celular cambian el tamaño real del dispositivo
          (no solo el ancho del panel) para que los breakpoints @container
          respondan igual que en la pantalla real de cada uno. */}
      <div className="min-w-0 flex-1">
        <div className="surface flex h-[80vh] flex-col overflow-hidden bg-card lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
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

          <div className="flex items-center justify-center gap-1 border-b border-border p-2">
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
            <p className="kicker-label border-b border-border px-3 py-2 text-muted-foreground">Guardado.</p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40">
            <DeviceFrame device={device}>
              <LandingPreview slug={slug} business={business} services={visibleServices} config={liveConfig} interactive={false} />
            </DeviceFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
