-- Constraints necesarias para que supabase/seed.sql sea idempotente
-- (ON CONFLICT (business_id, name/title) DO UPDATE).
alter table public.services
  add constraint services_business_name_key unique (business_id, name);

alter table public.knowledge_base
  add constraint knowledge_base_business_title_key unique (business_id, title);
