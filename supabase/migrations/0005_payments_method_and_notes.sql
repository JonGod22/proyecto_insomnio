-- Los pagos ya no son solo Mercado Pago: hay seña en efectivo, resto por
-- transferencia/alias, etc. Se agrega el método de cobro y una nota libre
-- para poder registrar todo lo que no pasa por una API (efectivo, Lemon,
-- otros alias), además de un descuento opcional sobre el monto.
--
-- NOTA: esta migración ya se aplicó directamente en Supabase (proyecto
-- compartido, schema "insomnio") vía el MCP. Se documenta acá para que el
-- historial de este repo quede consistente con el estado real de la base.

alter table insomnio.payments
  add column method text not null default 'mercadopago'
    check (method in ('mercadopago', 'efectivo', 'transferencia', 'otro')),
  add column notes text,
  add column discount_amount numeric(12, 2);

alter table insomnio.payments alter column method drop default;

comment on column insomnio.payments.method is 'Cómo se cobró: mercadopago (via webhook), efectivo/transferencia/otro (carga manual desde el admin).';
comment on column insomnio.payments.notes is 'Texto libre — ej. alias de transferencia, referencia de Lemon, etc.';
