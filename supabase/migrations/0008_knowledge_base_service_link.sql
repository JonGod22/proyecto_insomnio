-- Cada fragmento de conocimiento puede ligarse opcionalmente a un
-- servicio puntual (ej. políticas de "Extensiones Foxy Volumen" en vez
-- de solo info general del negocio), para que el agente pueda responder
-- con info específica de ese servicio cuando corresponda.
--
-- NOTA: ya aplicada directamente en Supabase (schema "insomnio") vía MCP.

alter table insomnio.knowledge_base
  add column service_id uuid references insomnio.services(id) on delete set null;

create index on insomnio.knowledge_base (service_id);

comment on column insomnio.knowledge_base.service_id is 'Opcional: liga este fragmento a un servicio puntual, para que el agente responda con info específica de ese servicio.';
