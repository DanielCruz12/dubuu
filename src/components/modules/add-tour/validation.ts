/**
 * Validación y filtrado compartido entre los formularios de Crear Tour y
 * Alquiler de Vehículo:
 * - Filtros por tipo de campo (numérico, texto seguro, placa/VIN).
 * - Sanitización anti-inyección (< > { } y bloques <script>).
 * - Handlers para filtrar mientras se escribe (onKeyDown/onPaste/onChange).
 * - Límites razonables de rangos y longitud.
 */
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
} from "react";

/** Límites compartidos entre ambos formularios. */
export const VALIDATION_LIMITS = {
  PRICE_MAX: 100000,
  DEPOSIT_MAX: 100000,
  FEE_PER_KM_MAX: 100,
  MAX_PEOPLE_MAX: 200,
  DURATION_MAX: 100,
  SEATING_MAX: 50,
  YEAR_MIN: 1900,
  RADIUS_KM_MAX: 200,
  NAME_MAX: 100,
  DESCRIPTION_MAX: 2000,
  ADDRESS_MAX: 200,
  DEPARTURE_POINT_MAX: 150,
  HIGHLIGHT_MAX: 500,
  INCLUDED_MAX: 2000,
  ITINERARY_ITEM_MAX: 300,
  LIST_ITEM_MAX: 200,
  BRAND_MODEL_MAX: 50,
  ENGINE_MAX: 50,
  PLATE_MAX: 20,
  VIN_MAX: 20,
  MAX_DECIMALS: 2,
} as const;

type TFunction = (key: string) => string;

/** Caracteres peligrosos que se bloquean en cualquier campo de texto. */
const UNSAFE_TEXT_CHARS = /[<>{}`]/g;

/** Secuencias peligrosas que se eliminan aunque lleguen pegadas. */
const SCRIPT_BLOCK = /<\s*\/?\s*script[^>]*>/gi;
const JAVASCRIPT_PROTOCOL = /javascript\s*:/gi;

/**
 * Sanitiza texto libre: elimina bloques <script>, el protocolo javascript:
 * y los caracteres < > { } (evita inyección de HTML/templates).
 * Se aplica de nuevo al enviar como defensa en profundidad.
 */
export function sanitizeText(raw: string): string {
  return raw
    .replace(SCRIPT_BLOCK, "")
    .replace(JAVASCRIPT_PROTOCOL, "")
    .replace(UNSAFE_TEXT_CHARS, "");
}

/** Filtra caracteres peligrosos mientras se escribe (texto libre). */
export function filterSafeText(raw: string): string {
  return raw.replace(UNSAFE_TEXT_CHARS, "");
}

/** Solo letras, números, espacios y guiones (placas). */
const PLATE_PATTERN = /[^A-Za-z0-9\s-]/g;

export function filterPlateChars(raw: string): string {
  return raw.replace(PLATE_PATTERN, "");
}

/** Solo letras, números y guiones (VIN). */
const VIN_PATTERN = /[^A-Za-z0-9-]/g;

export function filterVinChars(raw: string): string {
  return raw.replace(VIN_PATTERN, "");
}

/** Regex de validación final para placa y VIN (cubre datos restaurados). */
export const PLATE_REGEX = /^[A-Za-z0-9 -]*$/;
export const VIN_REGEX = /^[A-Za-z0-9-]*$/;

/** Números decimales: dígitos y un solo punto decimal (máx. 2 decimales). */
export function filterDecimalChars(
  raw: string,
  opts: { allowDecimal?: boolean; maxDecimals?: number } = {},
): string {
  const {
    allowDecimal = true,
    maxDecimals = VALIDATION_LIMITS.MAX_DECIMALS,
  } = opts;

  let cleaned = raw.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, "");

  if (!allowDecimal) return cleaned;

  // Un solo punto decimal.
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, "");
  }

  // Recortar decimales sobrantes.
  const [integerPart, decimalPart] = cleaned.split(".");
  if (decimalPart && decimalPart.length > maxDecimals) {
    cleaned = `${integerPart}.${decimalPart.slice(0, maxDecimals)}`;
  }

  return cleaned;
}

/** Números enteros: solo dígitos. */
export function filterIntegerChars(raw: string): string {
  return filterDecimalChars(raw, { allowDecimal: false });
}

/**
 * Devuelve el primer carácter del valor original que el filtro eliminó,
 * para mostrarlo en el mensaje de error (ej. "El carácter $ no está permitido.").
 */
export function findBlockedChar(original: string, cleaned: string): string | null {
  if (original === cleaned) return null;
  let j = 0;
  for (let i = 0; i < original.length; i++) {
    if (original[i] === cleaned[j]) {
      j++;
      continue;
    }
    return original[i];
  }
  return original[0] ?? null;
}

/** Mensaje cuando se bloquea un carácter en un campo numérico. */
export function numericBlockedMessage(t: TFunction, char: string | null): string {
  if (!char || /\s/.test(char)) {
    return t("dashboard.addTour.validation.numericOnly");
  }
  return t("dashboard.addTour.validation.numericCharBlocked").replace(
    "{{char}}",
    char,
  );
}

/** Mensaje cuando se bloquea un carácter en un campo de texto. */
export function textBlockedMessage(t: TFunction, char: string | null): string {
  if (!char || /\s/.test(char)) {
    return t("dashboard.addTour.validation.invalidChars");
  }
  return t("dashboard.addTour.validation.textCharBlocked").replace(
    "{{char}}",
    char,
  );
}

/** Devuelve true si la tecla es un carácter imprimible (no control/comando). */
function isPrintableKey(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): boolean {
  return !(e.ctrlKey || e.metaKey || e.altKey) && e.key.length === 1;
}

/**
 * Bloquea la tecla antes de que el carácter se inserte (evita el parpadeo).
 */
export function handleFilteredKeyDown(
  e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  filter: (raw: string) => string,
  onBlocked: (blockedChar: string) => void,
): void {
  if (!isPrintableKey(e)) return;
  if (filter(e.key) !== e.key) {
    e.preventDefault();
    onBlocked(e.key);
  }
}

/**
 * Filtra el texto pegado: si trae caracteres no permitidos, cancela el pegado
 * nativo e inserta la versión limpia en la posición del cursor.
 */
export function handleFilteredPaste(
  e: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  filter: (raw: string) => string,
  onChange: (value: string) => void,
  onBlocked: (blockedChar: string) => void,
): void {
  const el = e.currentTarget;
  const pasted = e.clipboardData.getData("text");
  if (!pasted) return;

  const cleanedPaste = filter(pasted);
  if (cleanedPaste === pasted) return; // el pegado normal pasa sin cambios

  e.preventDefault();
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const next = filter(
    el.value.slice(0, start) + cleanedPaste + el.value.slice(end),
  );
  onChange(next);
  onBlocked(findBlockedChar(pasted, cleanedPaste) ?? "?");

  // Restaurar el cursor tras el render del valor limpio.
  requestAnimationFrame(() => {
    const pos = Math.min(start + cleanedPaste.length, el.value.length);
    try {
      el.setSelectionRange(pos, pos);
    } catch {
      // ignore
    }
  });
}

/**
 * Filtra el valor en cada cambio (escribe, pega, arrastra, autocompleta).
 * Devuelve el valor limpio y avisa si se eliminó algún carácter.
 */
export function handleFilteredChange(
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  filter: (raw: string) => string,
  onChange: (value: string) => void,
  onBlocked: (blockedChar: string) => void,
): void {
  const raw = e.target.value;
  const cleaned = filter(raw);
  if (cleaned !== raw) {
    e.target.value = cleaned;
    onBlocked(findBlockedChar(raw, cleaned) ?? "?");
  }
  onChange(cleaned);
}

/** Clases de borde del campo según su estado de error. */
export function fieldBorderClass(hasError?: unknown): string {
  return hasError
    ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500"
    : "border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white";
}
