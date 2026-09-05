export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="relative flex size-14 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
      <p className="kicker-label animate-pulse text-muted-foreground">Cargando…</p>
    </div>
  );
}
