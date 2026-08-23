import { NextResponse } from "next/server";

/**
 * TODO: implementar cuando haya credenciales de Mercado Pago.
 * - Verificar firma del webhook (header x-signature) contra MERCADOPAGO_WEBHOOK_SECRET.
 * - Resolver el payment_id -> buscar preference/external_reference para
 *   encontrar appointment_id + business_id.
 * - Actualizar public.payments.status y, si corresponde, appointments.status.
 */
export async function POST(req: Request) {
  await req.json().catch(() => null);
  return NextResponse.json({ received: true });
}
