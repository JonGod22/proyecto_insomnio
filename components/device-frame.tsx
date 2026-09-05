"use client";

import { useEffect, useRef, useState } from "react";

export type DeviceId = "desktop" | "tablet" | "mobile";

const DEVICE_SPECS: Record<DeviceId, { width: number; height: number; label: string }> = {
  desktop: { width: 1280, height: 800, label: "Computadora" },
  tablet: { width: 810, height: 1080, label: "Tablet" },
  mobile: { width: 390, height: 844, label: "Celular" },
};

export const DEVICE_IDS = Object.keys(DEVICE_SPECS) as DeviceId[];
export { DEVICE_SPECS };

/**
 * Mockup de dispositivo (Mac / iPad / iPhone) alrededor de la vista previa —
 * en vez de una vista previa "pelada" que hay que imaginar, se ve tal cual
 * se vería en cada pantalla. El tamaño real del dispositivo es fijo (para
 * que los breakpoints @container respondan como en la pantalla real) y se
 * reduce con un `transform: scale()` para entrar en el panel disponible.
 */
export function DeviceFrame({ device, children }: { device: DeviceId; children: React.ReactNode }) {
  const spec = DEVICE_SPECS[device];
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const frameWidth = spec.width + (device === "desktop" ? 0 : 20);
  const chromeHeight = device === "desktop" ? 40 : 0;
  const frameHeight = spec.height + chromeHeight + (device === "desktop" ? 0 : 20);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const available = entries[0].contentRect.width - 32;
      setScale(Math.min(1, Math.max(0.25, available / frameWidth)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameWidth]);

  return (
    <div ref={wrapperRef} className="flex justify-center py-8">
      <div style={{ width: frameWidth * scale, height: frameHeight * scale }}>
        <div style={{ width: frameWidth, height: frameHeight, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {device === "desktop" ? (
            <div className="overflow-hidden rounded-xl border border-neutral-300 shadow-2xl">
              <div className="flex items-center gap-1.5 bg-neutral-200 px-3 py-2.5">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div style={{ width: spec.width, height: spec.height }} className="overflow-y-auto bg-white">
                {children}
              </div>
            </div>
          ) : device === "tablet" ? (
            <div className="rounded-[1.75rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
              <div className="relative overflow-hidden rounded-[1.1rem] bg-white" style={{ width: spec.width, height: spec.height }}>
                <div className="absolute left-1/2 top-2 z-10 size-1.5 -translate-x-1/2 rounded-full bg-neutral-700" />
                <div className="h-full overflow-y-auto">{children}</div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2.75rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
              <div className="relative overflow-hidden rounded-[2.1rem] bg-white" style={{ width: spec.width, height: spec.height }}>
                <div className="absolute left-1/2 top-2.5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-900" />
                <div className="h-full overflow-y-auto">{children}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
