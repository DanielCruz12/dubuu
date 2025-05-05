/**
 * Calcula el precio total incluyendo impuestos
 * @param basePrice - Precio base sin impuestos
 * @param options - Opciones de configuración
 * @returns Precio total formateado como string o como número
 */
export function calculatePriceWithTaxes(
  basePrice: number,
  options: {
    includeIVA?: boolean;
    includeTourismTax?: boolean;
    includeServiceFee?: boolean;
    quantity?: number;
    formatResult?: boolean;
  } = {}
): string | number {
  const {
    includeIVA = true,
    includeTourismTax = true,
    includeServiceFee = true,
    quantity = 1,
    formatResult = true,
  } = options;

  // Tasas de impuestos
  const IVA_RATE = 0.13; // 13%
  const TOURISM_TAX_RATE = 0.05; // 5%
  const SERVICE_FEE_RATE = 0.03; // 3%

  // Precio base multiplicado por cantidad
  let totalPrice = basePrice * quantity;

  // Añadir impuestos según configuración
  if (includeIVA) {
    totalPrice += basePrice * quantity * IVA_RATE;
  }

  if (includeTourismTax) {
    totalPrice += basePrice * quantity * TOURISM_TAX_RATE;
  }

  if (includeServiceFee) {
    totalPrice += basePrice * quantity * SERVICE_FEE_RATE;
  }

  // Formatear el resultado si se solicita
  if (formatResult) {
    return totalPrice.toFixed(2);
  }

  return totalPrice;
}

/**
 * Obtiene el desglose de impuestos para un precio base
 * @param basePrice - Precio base sin impuestos
 * @param quantity - Cantidad de productos
 * @returns Objeto con el desglose de impuestos
 */
export function getTaxBreakdown(basePrice: number, quantity = 1) {
  const subtotal = basePrice * quantity;
  const iva = subtotal * 0.13;
  const tourismTax = subtotal * 0.05;
  const serviceFee = subtotal * 0.03;
  const total = subtotal + iva + tourismTax + serviceFee;

  return {
    subtotal,
    iva,
    tourismTax,
    serviceFee,
    total,
  };
}
