-- Editor interno / super-admin: separado del Landing Builder por-tenant.
-- Guarda lo que hoy está hardcodeado en el código y es compartido por
-- TODOS los negocios (créditos del pie, copy del agente) para poder
-- editarlo sin tocar código. No reemplaza el Landing Builder: el Landing
-- Builder edita el `landing.config_json` de UN negocio; esto edita la
-- única fila de configuración de la plantilla base, compartida por todos.

alter table insomnio.profiles
  add column is_superadmin boolean not null default false;

-- Jonathan es el único super-admin hoy (dueño de la plataforma, no de un
-- negocio en particular).
update insomnio.profiles
set is_superadmin = true
where id in (select id from auth.users where email = 'godoyjonathan51@gmail.com');

create table insomnio.platform_settings (
  id smallint primary key default 1 check (id = 1),
  credit_name text not null default 'Jonathan Godoy',
  credit_github_url text,
  credit_instagram_url text,
  credit_whatsapp_url text,
  chat_greeting text not null default 'Preguntame por precios, disponibilidad o pedí un turno.',
  chat_suggestions text[] not null default array[
    '¿Qué servicios tienen?',
    'Quiero reservar un turno',
    '¿Cuánto sale una seña?'
  ],
  updated_at timestamptz not null default now()
);

insert into insomnio.platform_settings (
  id, credit_name, credit_github_url, credit_instagram_url, credit_whatsapp_url
) values (
  1,
  'Jonathan Godoy',
  'https://github.com/JonGod22',
  'https://www.instagram.com/jonathangodoy__/',
  'https://wa.me/5492634659520'
);

alter table insomnio.platform_settings enable row level security;

-- Toda landing pública (anon incluido) necesita leer esto para el pie de
-- créditos y el copy del agente.
create policy "platform settings: lectura pública" on insomnio.platform_settings
  for select using (true);

create or replace function insomnio.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path to 'insomnio'
as $$
  select coalesce((select is_superadmin from insomnio.profiles where id = auth.uid()), false)
$$;

create policy "platform settings: solo super-admin edita" on insomnio.platform_settings
  for update using (insomnio.is_superadmin())
  with check (insomnio.is_superadmin());

-- RLS filtra FILAS, no reemplaza el permiso de tabla de Postgres: sin este
-- grant, PostgREST devuelve 42501 "permission denied" antes de llegar a
-- evaluar la policy, aunque diga "using (true)".
grant select, update on insomnio.platform_settings to anon, authenticated;
