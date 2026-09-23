import {
  getRentalBasicSchema,
  getRentalVehicleSchema,
  getRentalDeliverySchema,
  type RentalBasicFormValues,
  type RentalVehicleFormValues,
  type RentalDeliveryFormValues,
} from "./types";
import {
  getCategorizationSchema,
  getMultimediaSchema,
  type CategorizationFormValues,
  type MultimediaFormValues,
} from "../add-tour/types";

const RENTAL_DRAFT_PREFIX = "dubuu-add-rental-draft";

/** Caducidad del borrador: 7 días. */
export const RENTAL_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Clave de localStorage por usuario y tipo de producto. */
function getRentalDraftKey(userId: string, typeId: string): string {
  return `${RENTAL_DRAFT_PREFIX}:${userId || "anon"}:${typeId || "default"}`;
}

/** Borrador serializable para localStorage (los archivos no se guardan). */
export interface RentalDraftStored {
  step: number;
  basic: RentalBasicFormValues | null;
  vehicle: RentalVehicleFormValues | null;
  delivery: RentalDeliveryFormValues | null;
  categorization: CategorizationFormValues | null;
  multimedia: MultimediaFormValues | null;
  /** Timestamp (ms) en que se guardó, para la caducidad. */
  savedAt: number;
}

type TFunction = (key: string) => string;

/** `t` silencioso para validar borradores (los mensajes no se muestran). */
const silentT: TFunction = () => "";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Valida la estructura y los datos del borrador recién leído.
 * Reutiliza los esquemas zod del formulario; si algo no encaja, se descarta.
 */
function isValidRentalDraft(draft: unknown): draft is RentalDraftStored {
  if (!isRecord(draft)) return false;
  if (
    typeof draft.step !== "number" ||
    !Number.isInteger(draft.step) ||
    draft.step < 1 ||
    draft.step > 5
  ) {
    return false;
  }
  if (typeof draft.savedAt !== "number" || !Number.isFinite(draft.savedAt)) {
    return false;
  }
  const ageMs = Date.now() - draft.savedAt;
  if (ageMs < 0 || ageMs > RENTAL_DRAFT_MAX_AGE_MS) {
    return false;
  }

  // Secciones obligatorias según el paso alcanzado.
  if (draft.step >= 2 && !getRentalBasicSchema(silentT).safeParse(draft.basic).success) {
    return false;
  }
  if (draft.step >= 3 && !getRentalVehicleSchema(silentT).safeParse(draft.vehicle).success) {
    return false;
  }
  if (draft.step >= 4 && !getRentalDeliverySchema(silentT).safeParse(draft.delivery).success) {
    return false;
  }
  if (
    draft.step >= 5 &&
    !getCategorizationSchema(silentT).safeParse(draft.categorization).success
  ) {
    return false;
  }
  if (
    draft.multimedia != null &&
    !getMultimediaSchema(silentT).safeParse(draft.multimedia).success
  ) {
    return false;
  }
  return true;
}

export function getRentalDraft(
  userId: string,
  typeId: string,
): RentalDraftStored | null {
  if (typeof window === "undefined") return null;
  const key = getRentalDraftKey(userId, typeId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidRentalDraft(parsed)) {
      // Caducado o corrupto: se descarta para no restaurar datos inválidos.
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setRentalDraft(
  draft: Omit<RentalDraftStored, "savedAt">,
  userId: string,
  typeId: string,
): void {
  if (typeof window === "undefined") return;
  const key = getRentalDraftKey(userId, typeId);
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ ...draft, savedAt: Date.now() }),
    );
  } catch {
    // quota or disabled
  }
}

export function clearRentalDraft(userId: string, typeId: string): void {
  if (typeof window === "undefined") return;
  const key = getRentalDraftKey(userId, typeId);
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
