-- Seed de datos reales: Yésica Studio (piloto).
-- Idempotente: se puede correr más de una vez sin duplicar.

insert into public.businesses (slug, name, description, address, city, working_hours)
values (
  'yesica-studio',
  'Yesica Studio',
  'Lash, Brows, Skin',
  'Bailén 102',
  'San Martín, Mendoza',
  '{
    "mon": [["10:00", "19:00"]],
    "tue": [["10:00", "19:00"]],
    "wed": [["10:00", "19:00"]],
    "thu": [["10:00", "19:00"]],
    "fri": [["10:00", "19:00"]],
    "sat": [["10:00", "14:00"]]
  }'::jsonb
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  address = excluded.address,
  city = excluded.city,
  working_hours = excluded.working_hours;

-- Servicios
with biz as (select id from public.businesses where slug = 'yesica-studio')
insert into public.services (business_id, name, description, price, price_on_request, deposit_amount, duration_minutes, duration_minutes_max)
select biz.id, v.name, v.description, v.price, v.price_on_request, v.deposit_amount, v.duration_minutes, v.duration_minutes_max
from biz, (values
  ('Extensiones Clásicas', 'Pestaña por pestaña, efecto natural.', 30000::numeric, false, null::numeric, 115, null::int),
  ('Extensiones Efecto Delineado', 'Densidad en la línea de pestañas, efecto delineador.', 35000::numeric, false, 10000::numeric, 90, 120),
  ('Extensiones Foxy Volumen', 'Volumen mixto, efecto zorruno.', 36000::numeric, false, 10000::numeric, 115, 120),
  ('Extensiones Clásicas Marrones', null, null::numeric, true, null::numeric, 115, null::int),
  ('Volumen Hollywood', null, null::numeric, true, null::numeric, 120, null::int),
  ('Retirado de Extensiones', null, null::numeric, true, null::numeric, 30, null::int),
  ('Diseño/Perfilado/Depilación de Cejas', null, null::numeric, true, null::numeric, 30, null::int)
) as v(name, description, price, price_on_request, deposit_amount, duration_minutes, duration_minutes_max)
on conflict (business_id, name) do update set
  description = excluded.description,
  price = excluded.price,
  price_on_request = excluded.price_on_request,
  deposit_amount = excluded.deposit_amount,
  duration_minutes = excluded.duration_minutes,
  duration_minutes_max = excluded.duration_minutes_max;

-- Landing (copy: beneficios y reseñas — no van a knowledge_base, son marketing)
with biz as (select id from public.businesses where slug = 'yesica-studio')
insert into public.landing (business_id, config_json)
select biz.id, '{
  "hero_subtitle": "Extensiones de pestañas, cejas y skincare en San Martín, Mendoza",
  "benefits": ["Diagnóstico previo", "Cepillo de regalo", "Garantía 3 días", "Masaje 15 min al cierre"],
  "reviews": {"rating": 5.0, "count": 7}
}'::jsonb
from biz
on conflict (business_id) do update set config_json = excluded.config_json;

-- Base de conocimiento (políticas/FAQs operativas — RAG, no transaccional)
with biz as (select id from public.businesses where slug = 'yesica-studio')
insert into public.knowledge_base (business_id, title, content)
select biz.id, v.title, v.content
from biz, (values
  ('Anticipación de reserva', 'La anticipación mínima para reservar un turno es de 1 a 6 horas según el servicio elegido.'),
  ('Seña obligatoria', 'Los servicios de volumen (Foxy Volumen, Volumen Hollywood) y el efecto delineado requieren seña obligatoria de $10.000 para confirmar el turno.'),
  ('Retoque recomendado', 'Se recomienda retocar las extensiones de pestañas cada 15 días para mantener el efecto.'),
  ('Durabilidad', 'Las extensiones de pestañas duran entre 3 y 4 semanas, dependiendo del ciclo de crecimiento natural de cada clienta.'),
  ('Contraindicaciones', 'El servicio de extensiones de pestañas está contraindicado durante el embarazo.'),
  ('Cuidados post-servicio', 'Después de la aplicación de extensiones: no mojar la zona por 24hs, no usar rímel, y evitar frotarse los ojos para preservar la duración del trabajo.')
) as v(title, content)
on conflict (business_id, title) do update set content = excluded.content;
