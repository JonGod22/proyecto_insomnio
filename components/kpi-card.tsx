import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  caption,
  accent,
}: {
  label: string;
  value: string;
  caption: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface p-5",
        accent ? "bg-primary text-primary-foreground" : "bg-card"
      )}
    >
      <p className={cn("kicker-label mb-2", accent ? "text-primary-foreground/70" : "text-muted-foreground")}>
        {label}
      </p>
      <p className="type-display text-4xl leading-none">{value}</p>
      <p className={cn("mt-2 text-sm", accent ? "text-primary-foreground/80" : "text-muted-foreground")}>
        {caption}
      </p>
    </div>
  );
}
