-- Proyecto Insomnio: schema inicial
-- Multitenant vía business_id. RLS obligatoria en todo lo que no sea
-- explícitamente público (storefront). Ver decisiones de arquitectura
-- en el brief del proyecto.

create extension if not exists pgcrypto;
create extension if not exists vector;

-- ============================================================
-- TABLAS
-- ============================================================

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  address text,
  city text,
  phone text,
  whatsapp_number text,
  working_hours jsonb not null default '{}'::jsonb, -- ej: {"mon":[["10:00","19:00"]]}
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text,
  price numeric(12, 2),
  price_on_request boolean not null default false,
  deposit_amount numeric(12, 2),
  duration_minutes int not null,
  duration_minutes_max int,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  notes text,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  service_id uuid not null references public.services (id),
  client_id uuid not null references public.clients (id),
  staff_id uuid references public.profiles (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  source text not null default 'manual' check (source in ('manual', 'agent')),
  notes text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  appointment_id uuid references public.appointments (id),
  client_id uuid not null references public.clients (id),
  amount numeric(12, 2) not null,
  type text not null check (type in ('deposit', 'full', 'refund')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'refunded')),
  mercadopago_payment_id text,
  mercadopago_preference_id text,
  created_at timestamptz not null default now()
);

create table public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  title text not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table public.landing (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  config_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index on public.services (business_id);
create index on public.clients (business_id);
create index on public.appointments (business_id, starts_at);
create index on public.payments (business_id);
create index on public.knowledge_base (business_id);
create index on public.knowledge_base using ivfflat (embedding vector_cosine_ops);

-- ============================================================
-- RLS HELPER
-- ============================================================

create or replace function public.get_my_business_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select business_id from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- RLS
-- ============================================================

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.landing enable row level security;

-- Storefront público: cualquiera puede leer el negocio, sus servicios
-- activos y su landing (es la vitrina pública del negocio).
create policy "public read businesses" on public.businesses
  for select using (true);

create policy "public read active services" on public.services
  for select using (active = true);

create policy "public read landing" on public.landing
  for select using (true);

-- Todo lo demás: aislado por tenant, solo staff autenticado del negocio.
create policy "tenant isolation profiles" on public.profiles
  for select using (business_id = public.get_my_business_id());

create policy "tenant write services" on public.services
  for all using (business_id = public.get_my_business_id())
  with check (business_id = public.get_my_business_id());

create policy "tenant isolation clients" on public.clients
  for all using (business_id = public.get_my_business_id())
  with check (business_id = public.get_my_business_id());

create policy "tenant isolation appointments" on public.appointments
  for all using (business_id = public.get_my_business_id())
  with check (business_id = public.get_my_business_id());

create policy "tenant isolation payments" on public.payments
  for all using (business_id = public.get_my_business_id())
  with check (business_id = public.get_my_business_id());

create policy "tenant isolation knowledge_base" on public.knowledge_base
  for all using (business_id = public.get_my_business_id())
  with check (business_id = public.get_my_business_id());

create policy "tenant write landing" on public.landing
  for all using (business_id = public.get_my_business_id())
  with check (business_id = public.get_my_business_id());

-- ============================================================
-- NÚCLEO ÚNICO DE DISPONIBILIDAD Y RESERVA
-- Camino manual (UI) y camino agente (chat) llaman a estas mismas
-- funciones. SECURITY DEFINER + grant a anon: el visitante público
-- (sin sesión) puede consultar y reservar sin exponer las tablas
-- crudas de appointments/clients a RLS de anon.
-- ============================================================

create or replace function public.get_available_slots(
  p_business_id uuid,
  p_service_id uuid,
  p_date date
)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_duration int;
  v_weekday text;
  v_ranges jsonb;
  v_range jsonb;
  v_tz text := 'America/Argentina/Mendoza';
  v_day_start timestamptz;
  v_day_end timestamptz;
  v_cursor timestamptz;
begin
  select duration_minutes into v_duration
  from public.services
  where id = p_service_id and business_id = p_business_id and active = true;

  if v_duration is null then
    return;
  end if;

  v_weekday := lower(to_char(p_date, 'dy'));

  select working_hours -> v_weekday into v_ranges
  from public.businesses
  where id = p_business_id;

  if v_ranges is null then
    return;
  end if;

  for v_range in select * from jsonb_array_elements(v_ranges)
  loop
    v_day_start := (p_date::text || ' ' || (v_range ->> 0))::timestamp at time zone v_tz;
    v_day_end := (p_date::text || ' ' || (v_range ->> 1))::timestamp at time zone v_tz;
    v_cursor := v_day_start;

    while v_cursor + (v_duration || ' minutes')::interval <= v_day_end loop
      if not exists (
        select 1 from public.appointments a
        where a.business_id = p_business_id
          and a.status <> 'cancelled'
          and a.starts_at < v_cursor + (v_duration || ' minutes')::interval
          and a.ends_at > v_cursor
      ) and v_cursor > now() then
        slot_start := v_cursor;
        slot_end := v_cursor + (v_duration || ' minutes')::interval;
        return next;
      end if;

      v_cursor := v_cursor + (v_duration || ' minutes')::interval;
    end loop;
  end loop;
end;
$$;

create or replace function public.create_appointment_atomic(
  p_business_id uuid,
  p_service_id uuid,
  p_client_name text,
  p_client_phone text,
  p_starts_at timestamptz,
  p_source text default 'manual'
)
returns public.appointments
language plpgsql
security definer
as $$
declare
  v_duration int;
  v_ends_at timestamptz;
  v_client_id uuid;
  v_appointment public.appointments;
begin
  -- Serializa todas las reservas de este negocio: garantiza que dos
  -- solicitudes concurrentes (UI y agente, o dos agentes) no puedan
  -- pisarse el mismo horario.
  perform pg_advisory_xact_lock(hashtext(p_business_id::text));

  select duration_minutes into v_duration
  from public.services
  where id = p_service_id and business_id = p_business_id and active = true;

  if v_duration is null then
    raise exception 'service_not_found';
  end if;

  v_ends_at := p_starts_at + (v_duration || ' minutes')::interval;

  if exists (
    select 1 from public.appointments a
    where a.business_id = p_business_id
      and a.status <> 'cancelled'
      and a.starts_at < v_ends_at
      and a.ends_at > p_starts_at
  ) then
    raise exception 'slot_conflict';
  end if;

  insert into public.clients (business_id, full_name, phone)
  values (p_business_id, p_client_name, p_client_phone)
  on conflict (business_id, phone)
  do update set full_name = excluded.full_name
  returning id into v_client_id;

  insert into public.appointments (
    business_id, service_id, client_id, starts_at, ends_at, status, source
  ) values (
    p_business_id, p_service_id, v_client_id, p_starts_at, v_ends_at, 'pending', p_source
  )
  returning * into v_appointment;

  return v_appointment;
end;
$$;

grant execute on function public.get_available_slots(uuid, uuid, date) to anon, authenticated;
grant execute on function public.create_appointment_atomic(uuid, uuid, text, text, timestamptz, text) to anon, authenticated;
