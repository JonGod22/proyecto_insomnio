import { createClient } from "@/lib/supabase/server";
import { KnowledgeManager } from "@/components/knowledge-manager";
import type { KnowledgeBaseEntry } from "@/lib/types";

export default async function KnowledgeAdminPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("knowledge_base")
    .select("id, business_id, title, content, embedding, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="type-display text-4xl leading-none">Base de conocimiento</h1>
      <KnowledgeManager entries={(entries as KnowledgeBaseEntry[]) ?? []} />
    </div>
  );
}
