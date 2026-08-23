export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold">Proyecto Insomnio</h1>
      <p className="text-muted-foreground">
        Sistema operativo modular para negocios de servicios. Cada negocio vive en{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">/[slug]</code>.
      </p>
    </main>
  );
}
