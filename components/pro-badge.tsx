import { CrownIcon } from "lucide-react";

// Marca visual de "esto es plan Pro" — nada está bloqueado todavía (toda la
// cuenta funciona en Free), solo queda marcado con la coronita para saber
// qué se va a diferenciar el día que exista el plan pago.
export function ProBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
      <CrownIcon className="size-2.5" />
      PRO
    </span>
  );
}
