-- Bucket público para assets de la landing (por ahora, el logo) subidos
-- desde el Landing Builder. Cada tenant escribe solo en su propia carpeta
-- (primer segmento del path = business_id), lectura pública para que la
-- landing real pueda mostrar el logo sin autenticación.
-- Ya aplicada en Supabase vía MCP; este archivo documenta el cambio.

insert into storage.buckets (id, name, public)
values ('landing-assets', 'landing-assets', true)
on conflict (id) do nothing;

create policy "tenant upload landing assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'landing-assets'
  and (storage.foldername(name))[1] = (select insomnio.get_my_business_id())::text
);

create policy "tenant update own landing assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'landing-assets'
  and (storage.foldername(name))[1] = (select insomnio.get_my_business_id())::text
);

create policy "public read landing assets"
on storage.objects for select to public
using (bucket_id = 'landing-assets');
