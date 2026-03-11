/** Moneda fija USD (sin conversión). Acepta number, string o null/undefined. */
export const USD_SYMBOL = "$";
export const formatUsd = (
  usdPrice: number | string | null | undefined
): number => {
  const n = Number(usdPrice);
  if (!Number.isFinite(n)) return 0;
  return Number(n.toFixed(2));
};
