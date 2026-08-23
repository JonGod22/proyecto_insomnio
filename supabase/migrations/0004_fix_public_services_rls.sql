-- La revocación de EXECUTE a anon en 0002_security_fixes.sql rompió el
-- storefront público: `services` (y cualquier tabla con una política
-- pública de select + una política "for all" de tenant) necesita evaluar
-- get_my_business_id() para resolver el OR entre ambas políticas, incluso
-- cuando la policy pública ya alcanza. Sin EXECUTE, PostgREST devuelve
-- "permission denied for function get_my_business_id" para anon.
-- Para anon la función siempre devuelve null (no hay fila en profiles),
-- así que no expone nada sensible: es seguro volver a otorgar el permiso.
grant execute on function public.get_my_business_id() to anon, authenticated;
