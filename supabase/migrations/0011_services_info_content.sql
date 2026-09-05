-- Wiki simple por servicio: contenido obligatorio (se pide en el form del
-- admin, no a nivel de columna para no romper servicios ya cargados) que se
-- muestra en la landing pública en un popup "Más información" por servicio,
-- más hasta 3 fotos opcionales.
-- Ya aplicada en Supabase vía MCP; este archivo documenta el cambio.

alter table insomnio.services
  add column if not exists info_content text,
  add column if not exists info_images text[] not null default '{}';
