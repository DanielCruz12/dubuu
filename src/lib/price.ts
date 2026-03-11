/**
 * Configuración de comisiones - Fácil de modificar
 */
const COMMISSION_RATES = {
  PLATFORM_RATE: 0.09, // 9% - Comisión de la plataforma
  PAYMENT_PROCESSING_RATE: 0.03, // 3% - Comisión del procesador de pagos
} as const;

/**
 * Calcula el precio total incluyendo comisiones
 * @param basePrice - Precio base sin comisiones
 * @param options - Opciones de configuración
 * @returns Precio total formateado como string o como número
 */

/**
 * Obtiene el desglose de comisiones para un precio base
 * @param basePrice - Precio base sin comisiones
 * @param quantity - Cantidad de productos
 * @returns Objeto con el desglose de comisiones
 */
export function getTaxBreakdown(basePrice: number, quantity = 1) {
  const subtotal = basePrice * quantity;
  const platformFee = subtotal * COMMISSION_RATES.PLATFORM_RATE;
  const paymentProcessing = subtotal * COMMISSION_RATES.PAYMENT_PROCESSING_RATE;
  const total = subtotal + platformFee + paymentProcessing;

  return {
    subtotal,
    platformFee,
    paymentProcessing,
    total,
    // Para mantener compatibilidad con el código existente
    serviceFee: platformFee,
    iva: paymentProcessing,
  };
}

/**
 * Calcula cuánto recibe el host desde el precio final (para multimedia-step)
 * @param finalPrice - Precio final que paga el usuario
 * @param quantity - Cantidad
 * @returns Desglose desde precio final
 */
export function getHostEarningsFromFinalPrice(
  finalPrice: number,
  quantity = 1
) {
  const userPays = finalPrice * quantity;
  const platformFee = userPays * COMMISSION_RATES.PLATFORM_RATE;
  const paymentProcessing = userPays * COMMISSION_RATES.PAYMENT_PROCESSING_RATE;
  const hostReceives = userPays - platformFee - paymentProcessing;

  return {
    userPays,
    platformFee,
    paymentProcessing,
    hostReceives,
  };
}

/**
 * Obtiene las tasas de comisión actuales
 * @returns Objeto con las tasas de comisión
 */
export function getCommissionRates() {
  return {
    platformRate: COMMISSION_RATES.PLATFORM_RATE,
    paymentProcessingRate: COMMISSION_RATES.PAYMENT_PROCESSING_RATE,
    platformPercentage: `${(COMMISSION_RATES.PLATFORM_RATE * 100).toFixed(0)}%`,
    paymentProcessingPercentage: `${(COMMISSION_RATES.PAYMENT_PROCESSING_RATE * 100).toFixed(0)}%`,
  };
}

const TOTAL_COMMISSION_RATE =
  COMMISSION_RATES.PLATFORM_RATE + COMMISSION_RATES.PAYMENT_PROCESSING_RATE;

/**
 * Calcula lo que recibe el host a partir del total cobrado (suma de precios finales).
 * Usado en el panel para mostrar "Ingresos totales" después de comisión.
 */
export function getHostEarningsFromTotalSum(totalCollected: number): number {
  return totalCollected * (1 - TOTAL_COMMISSION_RATE);
}
