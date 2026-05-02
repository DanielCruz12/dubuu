/**
 * Claves canónicas de tipo de producto (frontend).
 * En BD / traducciones el `name` puede variar; usar resolveProductTypeKey() o normalizeProductTypeName().
 */

export const ProductTypeKey = {
  TOUR: "tour",
  RENTAL: "rental",
} as const;

export type ProductTypeKey =
  (typeof ProductTypeKey)[keyof typeof ProductTypeKey];

/** Variantes que mapean a la misma clave (API, query params, textos). */
export const PRODUCT_TYPE_ALIASES: Record<
  ProductTypeKey,
  readonly string[]
> = {
  [ProductTypeKey.TOUR]: ["tours", "tour", "viajes", "viaje"],
  [ProductTypeKey.RENTAL]: [
    "rental",
    "rentals",
    "rental car",
    "rental cars",
    "car rental",
    "car rentals",
    "renta de autos",
    "alquiler",
    "alquileres",
  ],
};

/** Valor habitual de `?product_type=` para listados tipo tour (convención API). */
export const DEFAULT_PRODUCT_TYPE_QUERY = "tours";

const canonicalByAlias = new Map<string, ProductTypeKey>();
for (const key of Object.values(ProductTypeKey)) {
  for (const alias of PRODUCT_TYPE_ALIASES[key]) {
    canonicalByAlias.set(alias.toLowerCase(), key);
  }
}

function isCanonicalKey(value: string): value is ProductTypeKey {
  return value === ProductTypeKey.TOUR || value === ProductTypeKey.RENTAL;
}

/**
 * Coincidencia exacta de alias → clave canónica; si no, devuelve el string en minúsculas (como el backend).
 */
export function normalizeProductTypeName(name: string): ProductTypeKey | string {
  const normalized = name.trim().toLowerCase();
  return canonicalByAlias.get(normalized) ?? normalized;
}

/**
 * Interpreta `product_types.name` (o traducción) y devuelve una clave canónica, o null si no se reconoce.
 * Usa alias exactos primero y luego subcadenas para títulos largos ("Alquiler de autos", etc.).
 */
export function resolveProductTypeKey(name: string | undefined): ProductTypeKey | null {
  if (!name?.trim()) return null;

  const exact = normalizeProductTypeName(name);
  if (isCanonicalKey(exact)) return exact;

  const haystack = name.trim().toLowerCase();

  for (const alias of PRODUCT_TYPE_ALIASES[ProductTypeKey.RENTAL]) {
    if (haystack.includes(alias.toLowerCase())) return ProductTypeKey.RENTAL;
  }
  for (const alias of PRODUCT_TYPE_ALIASES[ProductTypeKey.TOUR]) {
    if (haystack.includes(alias.toLowerCase())) return ProductTypeKey.TOUR;
  }

  

  return null;
}

/** Tabla de productos / rutas del dashboard (histórico `tours` plural). */
export type ProductFormKind = "tours" | "rental";

export function productTypeKeyToFormKind(key: ProductTypeKey): ProductFormKind {
  return key === ProductTypeKey.TOUR ? "tours" : "rental";
}

export function formKindToProductTypeKey(kind: ProductFormKind): ProductTypeKey {
  return kind === "tours" ? ProductTypeKey.TOUR : ProductTypeKey.RENTAL;
}

export function productTypeNameToFormKind(
  name: string | undefined,
): ProductFormKind | null {
  const key = resolveProductTypeKey(name);
  return key ? productTypeKeyToFormKind(key) : null;
}

/**
 * Convierte parámetros tipo `"tours"` | `"rental"` | alias a clave canónica.
 */
export function parseProductTypeParam(param: string): ProductTypeKey | null {
  const p = param.trim().toLowerCase();
  if (["tours", "tour", "viajes", "viaje"].includes(p)) return ProductTypeKey.TOUR;
  if (["rental", "rentals", "alquiler", "alquileres"].includes(p))
    return ProductTypeKey.RENTAL;

  const n = normalizeProductTypeName(param);
  return isCanonicalKey(n) ? n : null;
}

/** Alias por clave (útil para filtros tipo ilike contra traducciones). */
export function getProductTypeSearchAliases(key: ProductTypeKey): string[] {
  return [...PRODUCT_TYPE_ALIASES[key]];
}
