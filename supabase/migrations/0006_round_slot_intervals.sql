-- Los horarios ofrecidos avanzaban de a "duración del servicio" (ej. 115
-- min), así que después del primer turno del día quedaban en horas no
-- redondas (10:55, 12:50...). Se cambia el paso del cursor a un intervalo
-- fijo de 15 minutos — la ventana de conflicto sigue usando la duración
-- real del servicio, solo cambia en qué horarios se ofrece empezar.
--
-- NOTA: ya aplicada directamente en Supabase (schema "insomnio") vía MCP.

create or replace function insomnio.get_available_slots(
  p_business_id uuid,
  p_service_id uuid,
  p_date date
)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql
security definer
stable
set search_path = insomnio
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
  v_step interval := interval '15 minutes';
begin
  select duration_minutes into v_duration
  from insomnio.services
  where id = p_service_id and business_id = p_business_id and active = true;

  if v_duration is null then
    return;
  end if;

  v_weekday := lower(to_char(p_date, 'dy'));

  select working_hours -> v_weekday into v_ranges
  from insomnio.businesses
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
        select 1 from insomnio.appointments a
        where a.business_id = p_business_id
          and a.status <> 'cancelled'
          and a.starts_at < v_cursor + (v_duration || ' minutes')::interval
          and a.ends_at > v_cursor
      ) and v_cursor > now() then
        slot_start := v_cursor;
        slot_end := v_cursor + (v_duration || ' minutes')::interval;
        return next;
      end if;

      v_cursor := v_cursor + v_step;
    end loop;
  end loop;
end;
$$;
