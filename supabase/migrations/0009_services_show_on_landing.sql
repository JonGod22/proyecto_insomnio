-- Permite ocultar un servicio de la landing sin desactivarlo del todo
-- (sigue siendo reservable por link directo / agente) — independiente
-- del flag "active" que ya existía.
--
-- NOTA: ya aplicada directamente en Supabase (schema "insomnio") vía MCP.

alter table insomnio.services
  add column show_on_landing boolean not null default true;

comment on column insomnio.services.show_on_landing is 'Independiente de "active": permite ocultar un servicio de la landing sin desactivarlo (ej. sigue siendo reservable por link directo o por el agente).';
