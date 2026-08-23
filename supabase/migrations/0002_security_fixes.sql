-- Fija search_path en create_appointment_atomic (evita hijacking vía
-- search_path mutable en funciones SECURITY DEFINER).
alter function public.create_appointment_atomic(uuid, uuid, text, text, timestamptz, text)
  set search_path = public;

-- get_my_business_id es un helper interno para políticas RLS: no debe
-- ser invocable directamente vía RPC por anon.
revoke execute on function public.get_my_business_id() from public;
revoke execute on function public.get_my_business_id() from anon;
grant execute on function public.get_my_business_id() to authenticated;

-- Mueve la extensión vector fuera de public (buena práctica: separar
-- extensiones del esquema de datos de la aplicación).
create schema if not exists extensions;
alter extension vector set schema extensions;
