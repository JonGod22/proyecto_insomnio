-- Antes solo había "public read businesses" (select). El Landing Builder
-- ahora permite editar nombre/dirección/ciudad del negocio (identidad),
-- así que el staff autenticado necesita poder hacer update sobre su
-- propio negocio.
--
-- NOTA: ya aplicada directamente en Supabase (schema "insomnio") vía MCP.

create policy "tenant write businesses" on insomnio.businesses
  for update using (id = insomnio.get_my_business_id())
  with check (id = insomnio.get_my_business_id());
