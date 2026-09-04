export type PaymentForBalance = {
  appointment_id: string | null;
  status: string;
  type: string;
  amount: number;
  discount_amount: number | null;
};

/** Suma los pagos aprobados (netos de descuento, sin devoluciones) de un
 * turno — misma cuenta que usa el módulo de Pagos para "saldo pendiente",
 * centralizada acá porque Turnos también necesita mostrarla por fila. */
export function paidForAppointment(payments: PaymentForBalance[], appointmentId: string) {
  return payments
    .filter((p) => p.appointment_id === appointmentId && p.status === "approved" && p.type !== "refund")
    .reduce((sum, p) => sum + Number(p.amount) - Number(p.discount_amount ?? 0), 0);
}

/** Precio "cobrable" de un servicio, o null si es a consultar / sin precio
 * cargado — en ese caso no tiene sentido calcular saldo. */
export function priceForBalance(service: { price: number | null; price_on_request: boolean } | null) {
  if (!service || service.price_on_request || service.price === null) return null;
  return Number(service.price);
}
