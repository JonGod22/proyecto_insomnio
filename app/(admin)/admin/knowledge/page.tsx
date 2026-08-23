export default function KnowledgeAdminPage() {
  // TODO: CRUD sobre public.knowledge_base (políticas/FAQs/tono) +
  // pipeline de embeddings (OpenAI text-embedding-3-small, 1536 dims)
  // que se dispare on insert/update de content.
  return (
    <div>
      <h1 className="type-display text-3xl leading-none">Base de conocimiento</h1>
      <p className="kicker-label mt-3 text-muted-foreground">Próximamente</p>
    </div>
  );
}
