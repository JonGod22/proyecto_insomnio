# Estado del proyecto — Proyecto Insomnio

> Este documento es para que cualquier sesión nueva de Claude (u otra
> persona) entienda el proyecto sin necesitar el historial de chat.
> **No contiene ninguna contraseña, clave ni token real** — solo dice
> dónde están guardados. Este archivo se commitea al repo público, así
> que nunca hay que pegar secretos acá adentro.

## Qué es

Sistema operativo modular multitenant para negocios de servicios
(reservas + agente de IA + panel de administración). Cada negocio
opera aislado vía `business_id` con Row Level Security en Postgres.
Primer caso real: **Yésica Studio** (estética — lash/brows/skin, San
Martín, Mendoza).

## Contexto: ecosistema multi-proyecto de Jonathan (importante)

Jonathan está usando este mismo stack para varios proyectos propios,
no solo Insomnio. Como el plan gratis de Supabase permite un solo
proyecto/base de datos por cuenta, la estrategia elegida es:

- **Una única instancia de Supabase** (`ojxjbgmixxzetipjobhn`),
  compartida entre proyectos.
- **Cada proyecto vive en su propio *schema* de Postgres** dentro de
  esa misma base — así los datos quedan separados igual, sin pagar:
  - `insomnio` → este proyecto (Proyecto Insomnio / Yésica Studio).
  - `social_post` → otra app de Jonathan, no relacionada.
  - `landing` → una landing "hub" que Jonathan está armando aparte,
    para centralizar y mostrar sus proyectos (linkea a las demos
    públicas de Insomnio y SocialPost). En el futuro también va a
    tener una sección de contacto. No es prioridad ahora mismo.
- **Vercel sí tiene un proyecto separado por app** (dentro de lo que
  permite el plan gratis) — Insomnio despliega solo su propio código,
  no comparte deploy con las otras.
- Esta arquitectura (schema compartido en Supabase) es **intencional
  y debe seguir así**. Si en el futuro alguien pausa/borra el
  proyecto de Supabase pensando que es solo de otra app, se lleva
  puesto Insomnio también — tenerlo en cuenta.

## Pipeline de infraestructura

```
GitHub (push a main) → Vercel (build + deploy automático) → Supabase, schema "insomnio" (Postgres, Auth, RLS)
```

- **Repo:** https://github.com/JonGod22/proyecto_insomnio (público)
- **Producción:** https://proyectoinsomnio.vercel.app/yesica-studio
- **Admin:** https://proyectoinsomnio.vercel.app/login
- **Proyecto Supabase:** `ojxjbgmixxzetipjobhn` (compartido, ver
  arriba) — este proyecto usa el schema **`insomnio`**, no `public`.
  Los tres clientes de Supabase (`lib/supabase/{client,server,admin}.ts`)
  tienen `db: { schema: "insomnio" }` explícito — si algún día se
  agrega un cliente nuevo hay que repetir esa opción o se conecta al
  schema `public` (vacío) por error.
- **Proyecto Vercel:** `proyecto_insomnio`, team `jongod22s-projects`

## Dónde vive el código

El proyecto corre desde un disco externo:
`/Volumes/KINGSTON/Proyecto de insomnio 1`

**⚠️ Notas de compatibilidad exFAT** (el disco está formateado exFAT,
no HFS+/APFS — esto ya se solucionó, pero si vuelve a pasar es por
esto):
- La caché persistente de Turbopack (`next dev`) no es compatible con
  exFAT → desactivada en `next.config.ts`
  (`experimental.turbopackFileSystemCacheForDev: false`).
- La caché de imágenes optimizadas de Next.js se corrompe al
  escribirse en exFAT → `images.unoptimized` está en `true` solo en
  desarrollo local (`NODE_ENV === "development"`); en Vercel sigue
  optimizando normal porque corre en otro filesystem.
- Si `npm run dev` o `npm run build` tiran el error "Failed to open
  database / Loading persistence directory failed", borrar `.next`
  (`rm -rf .next`) y volver a correr — es sólo caché, no se pierde
  nada.
- Si el disco se desconecta a mitad de una escritura hay más riesgo
  de corrupción que en un disco interno: conviene no desconectarlo
  mientras el servidor de desarrollo está corriendo.

## Cómo levantar el proyecto localmente

```bash
cd "/Volumes/KINGSTON/Proyecto de insomnio 1"
npm run dev
```

Necesita un archivo `.env.local` (no está en el repo, es secreto) con:

| Variable | De dónde sale |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (es pública por diseño, protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (secreta) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `MERCADOPAGO_ACCESS_TOKEN` / `MERCADOPAGO_WEBHOOK_SECRET` | Pendiente: todavía no se integró Mercado Pago |

Las mismas 4 primeras variables están cargadas en Vercel (Settings →
Environment Variables del proyecto) para producción.

La cuenta de admin de prueba (`godoyjonathan51@gmail.com`, vinculada
a Yésica Studio como `owner`) tiene su contraseña guardada por
Jonathan fuera de este repo — no está documentada acá a propósito.

## Arquitectura — decisiones clave

1. **RAG ≠ datos transaccionales.** `knowledge_base` guarda políticas
   y FAQs (contenido no estructurado). Precio, duración y
   disponibilidad siempre se consultan en tiempo real contra las
   tablas relacionales — nunca por embedding, para evitar
   alucinaciones. *(Nota: la búsqueda en `knowledge_base` hoy usa
   `ilike` como placeholder, no embeddings reales — ver pendientes.)*
2. **Núcleo único de disponibilidad.** El camino manual (UI de
   `/booking`) y el camino del agente (chat) llaman a las mismas dos
   funciones de Postgres: `get_available_slots()` y
   `create_appointment_atomic()`, esta última con
   `pg_advisory_xact_lock` para que dos reservas simultáneas nunca
   pisen el mismo horario.
3. **Multitenant disciplinado.** Todo filtra por `business_id` vía
   RLS y la función `get_my_business_id()`. Única excepción
   documentada: el endpoint del agente (`/api/chat`) usa
   `service_role` server-side porque no hay JWT de usuario anónimo;
   inyecta `business_id` desde el `slug` de la URL. Esa key nunca se
   expone al cliente.
4. **Function calling cerrado.** El agente nunca escribe SQL ni
   inventa horarios: solo puede ofrecer slots que salieron de
   `get_available_slots()`, y si `create_booking` falla por
   conflicto, tiene que re-consultar antes de responder.

## Estructura de carpetas

```
app/(public)/[slug]/page.tsx        # landing pública por negocio
app/(public)/[slug]/booking         # Camino A: flujo manual
app/(public)/api/chat               # Camino B: endpoint del agente
app/(public)/api/webhooks/mercadopago
app/(admin)/admin/...               # dashboard (turnos, servicios, clientes, pagos, landing, aprendizaje)
app/(admin)/login                   # auth
lib/supabase/{client,server,admin}.ts
lib/agent/{tools,prompt,engine}.ts
lib/booking/availability.ts         # única fuente de verdad de disponibilidad
lib/types.ts                        # tipos generados desde el schema real de Supabase
supabase/migrations                 # 0001-0004, historial real aplicado
supabase/seed.sql                   # datos reales de Yésica Studio
```

## Qué funciona hoy (probado de punta a punta)

- Landing pública con hero a pantalla completa, servicios reales
  (precio/seña/duración desde la DB), galería, mapa embebido, footer
  con contacto del desarrollador.
- Reserva manual (`/[slug]/booking`) y reserva por chat con el
  agente — ambas atómicas, sin doble-booking.
- Chat flotante del agente (Claude, function calling) — responde
  precios/disponibilidad reales y confirma turnos.
- Login/logout con Supabase Auth, RLS multitenant.
- Dashboard de admin: KPIs reales (turnos, clientes, ingresos,
  servicios), tabla de turnos con filtro Hoy/Semana/Mes y cambio de
  estado, CRUD completo de Servicios, listado de Clientes.

## Qué falta (mejora incremental, "de a poco" — no todo junto)

Dirección que dio Jonathan: ir sumando cosas de a poco tanto a
Insomnio como a SocialPost y a la landing-hub. Para Insomnio, en este
orden:

1. **Responsive / mobile:** que la landing y el resto se vean bien en
   formato vertical/celular. *(en curso — ver más abajo)*
2. **Backend:** seguir sumando funcionalidad real (Mercado Pago, RAG
   real, CRUD faltantes — ver detalle abajo).
3. **Diseño:** seguir puliendo cómo se va a ver el producto terminado.
4. **Landing Builder con drag-and-drop:** a futuro, que el dueño del
   negocio pueda armar su propia landing arrastrando módulos, en vez
   de que se edite por SQL. Es una mejora de mediano plazo, no
   inmediata.

Pendientes concretos de backend, sin orden estricto:
- **Mercado Pago:** integración real de cobro + webhook (hoy es un
  stub que solo responde `200 OK`).
- **Admin → Pagos:** listar pagos reales una vez haya Mercado Pago.
- **Admin → Base de conocimiento:** CRUD para cargar/editar políticas
  (hoy sólo se ven los datos sembrados por SQL).
- **RAG real:** pipeline de embeddings (ej. OpenAI
  `text-embedding-3-small`, 1536 dims para calzar con la columna
  `knowledge_base.embedding`) + función de búsqueda vectorial
  (`<=>` cosine distance) en vez del `ilike` actual.
- **Admin → Landing Builder:** editor visual para
  `landing.config_json` (hoy se edita solo por SQL) — versión simple
  antes de pensar en el drag-and-drop.
- **Multi-negocio real:** el sistema ya es multitenant a nivel de
  base de datos; falta un flujo de onboarding para dar de alta un
  segundo negocio sin pasar por SQL manual.

## Seguridad — resumen de la auditoría (2026-08)

- Se revisó todo el historial de git en busca de claves/tokens/
  contraseñas filtradas: **no se encontró ninguna.** `.env*` nunca se
  commiteó.
- La `NEXT_PUBLIC_SUPABASE_ANON_KEY` que sí está pensada para ser
  pública (va en el navegador) — su seguridad depende de que las
  políticas RLS estén bien puestas, no de mantenerla en secreto. Se
  revisaron con `get_advisors` de Supabase; las únicas alertas
  activas son intencionales (funciones RPC que el agente y la reserva
  pública necesitan poder llamar sin login).
- Se sacaron del repo público (`git rm --cached`, quedan en
  `.gitignore`) dos documentos de trabajo interno
  (`docs/contexto_yesica_studio.md`,
  `docs/informe_analisis_competitivo_agora.md`) porque tenían nombres
  reales de clientas en reseñas y estrategia competitiva — no hacía
  falta que estuvieran en un repo público. Siguen existiendo en el
  disco local, solo dejaron de subirse a GitHub.
- El repo siendo público **no expone ninguna vulnerabilidad real**:
  la seguridad multitenant vive en las políticas RLS de Postgres
  (server-side), no en mantener el código en secreto. Cualquiera que
  vea el código no puede saltarse esas políticas.
