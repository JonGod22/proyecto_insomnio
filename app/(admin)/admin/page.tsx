import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppointmentsTable, type AppointmentRow } from "@/components/appointments-table";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import type { Json, LandingConfig } from "@/lib/types";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const in31Days = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = startOfMonth();

  const [
    { count: servicesActive },
    { count: clientsTotal },
    { count: clientsThisMonth },
    { count: upcomingThisWeek },
    { data: payments },
    { count: knowledgeCount },
    { data: landing },
    { data: appointments },
  ] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", now.toISOString())
      .lte("starts_at", in7Days)
      .neq("status", "cancelled"),
    supabase.from("payments").select("amount").eq("status", "approved").gte("created_at", monthStart),
    supabase.from("knowledge_base").select("id", { count: "exact", head: true }),
    supabase.from("landing").select("config_json").maybeSingle(),
    supabase
      .from("appointments")
      .select("id, starts_at, ends_at, status, source, client:clients(full_name, phone), service:services(name)")
      .gte("starts_at", now.toISOString())
      .lte("starts_at", in31Days)
      .order("starts_at"),
  ]);

  const revenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const monthLabel = now.toLocaleDateString("es-AR", { month: "long" });
  const agentReady = Boolean(process.env.ANTHROPIC_API_KEY);
  const config = (landing?.config_json ?? {}) as Json as LandingConfig;

  const landingSections = [
    { label: "Identidad", done: true },
    { label: "Hero", done: true },
    { label: "Beneficios", done: Boolean(config.benefits?.length) },
    { label: "Reseñas", done: Boolean(config.reviews) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="type-display text-4xl leading-none">Dashboard</h1>
        <Badge variant="live">{agentReady ? "Agente activo" : "Agente sin configurar"}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Próximos turnos" value={String(upcomingThisWeek ?? 0)} caption="esta semana" />
        <KpiCard
          label="Clientes"
          value={String(clientsTotal ?? 0)}
          caption={`+${clientsThisMonth ?? 0} este mes`}
        />
        <KpiCard
          label="Ingresos"
          value={new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0, notation: "compact" }).format(revenue)}
          caption={`${monthLabel}, acreditado`}
          accent
        />
        <KpiCard label="Servicios" value={String(servicesActive ?? 0)} caption="activos en la landing" />
      </div>

      <AppointmentsTable appointments={(appointments as unknown as AppointmentRow[]) ?? []} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="type-display text-xl leading-none">Aprendizaje</p>
            <Badge variant="outline">RAG · {knowledgeCount ?? 0} fragmentos</Badge>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Lo que cargás acá es lo único que el agente puede responder. No hay reentrenamiento: se
            indexa y se consulta en tiempo real.
          </p>
          <Link href="/admin/knowledge" className="kicker-label text-foreground underline">
            Ver base de conocimiento
          </Link>
        </div>

        <div className="surface bg-foreground p-5 text-background">
          <p className="type-display mb-3 text-xl leading-none">Landing Builder</p>
          <p className="mb-4 text-sm text-background/70">
            Bloques configurables guardados en JSON. Al publicar se revalida la página estática.
          </p>
          <ul className="mb-4 space-y-2 text-sm">
            {landingSections.map((s) => (
              <li key={s.label} className="flex items-center justify-between border-b border-background/10 pb-2">
                <span>{s.label}</span>
                <span className={s.done ? "text-primary" : "text-background/50"}>
                  {s.done ? "configurado" : "pendiente"}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/admin/landing-builder" className="kicker-label text-primary underline">
            Ir al editor
          </Link>
        </div>
      </div>
    </div>
  );
}
