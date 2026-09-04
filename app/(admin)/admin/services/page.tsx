import { createClient } from "@/lib/supabase/server";
import { ServicesTable } from "@/components/services-table";

export default async function ServicesAdminPage() {
  const supabase = await createClient();
  const [{ data: services }, { data: knowledge }] = await Promise.all([
    supabase.from("services").select("*").order("name"),
    supabase.from("knowledge_base").select("*").not("service_id", "is", null),
  ]);

  return (
    <div>
      <h1 className="type-display mb-6 text-3xl leading-none">Servicios</h1>
      <ServicesTable services={services ?? []} knowledge={knowledge ?? []} />
    </div>
  );
}
