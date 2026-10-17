/**
 * Configuración de comisiones - Fácil de modificar
 */
const COMMISSION_RATES = {
  PLATFORM_RATE: 0.085, // 8.5 % - Ganancia neta de Dubuu
  PAYMENT_PROCESSING_RATE: 0.035, // 3.5 % - Wompi
} as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Calcula cuánto recibe el host desde el precio final (para multimedia-step)
 * @param finalPrice - Precio final que paga el usuario
 * @param quantity - Cantidad
 * @returns Desglose desde precio final
 */
export function getHostEarningsFromFinalPrice(finalPrice: number, quantity = 1) {
  const userPays = round2(finalPrice * quantity);
  const totalFee = round2(userPays * (COMMISSION_RATES.PLATFORM_RATE + COMMISSION_RATES.PAYMENT_PROCESSING_RATE));
  const paymentProcessing = round2(userPays * COMMISSION_RATES.PAYMENT_PROCESSING_RATE);
  const platformFee = round2(totalFee - paymentProcessing);
  const hostReceives = round2(userPays - totalFee);

  return { userPays, platformFee, paymentProcessing, hostReceives };
}

/**
 * Calcula lo que recibe el host a partir del total cobrado (suma de precios finales).
 * Usado en el panel para mostrar "Ingresos totales" después de comisión.
 */
export function getHostEarningsFromTotalSum(totalCollected: number): number {
  return getHostEarningsFromFinalPrice(totalCollected, 1).hostReceives;
}
