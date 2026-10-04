import type {
  BasicInfoFormValues,
  LocationFormValues,
  DetailsFormValues,
  CategorizationFormValues,
  MultimediaFormValues,
  TourDateMetaRow,
} from "./types";
import {
  getBasicInfoSchema,
  getLocationSchema,
  getDetailsSchema,
  getCategorizationSchema,
  getMultimediaSchema,
} from "./types";

/** Normaliza lo que venga de la API (es/en, con o sin acentos) a los valores del `<Select>`. */
export function normalizeTourDifficultyForForm(
  raw: unknown,
): DetailsFormValues["difficulty"] {
  const s = String(raw ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  const map: Record<string, DetailsFormValues["difficulty"]> = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
    extreme: "extreme",
    facil: "easy",
    moderado: "medium",
    dificil: "hard",
    extremo: "extreme",
    leve: "easy",
  };
  return map[s] ?? "medium";
}

const ADD_TOUR_DRAFT_PREFIX = "dubuu-add-tour-draft";

/** Caducidad del borrador: 7 d\u00edas. */
export const ADD_TOUR_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Clave de localStorage por usuario y tipo de producto. */
function getAddTourDraftKey(userId: string, typeId: string): string {
  return `${ADD_TOUR_DRAFT_PREFIX}:${userId || "anon"}:${typeId || "default"}`;
}

/** Borrador serializable para localStorage (fechas como ISO string) */
export interface AddTourDraftStored {
  step: number;
  basicInfo: BasicInfoFormValues | null;
  location: LocationFormValues | null;
  details: DetailsFormValuesStored | null;
  categorization: CategorizationFormValues | null;
  multimedia: MultimediaFormValues | null;
  /** Timestamp (ms) en que se guard\u00f3, para la caducidad. */
  savedAt: number;
}

interface DetailsFormValuesStored
  extends Omit<DetailsFormValues, "available_dates"> {
  available_dates: string[];
}

type TFunction = (key: string) => string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** `t` silencioso para validar borradores (los mensajes no se muestran). */
const silentT: TFunction = () => "";

function isValidIsoDateList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string" && !Number.isNaN(Date.parse(item)),
    )
  );
}

/**
 * Valida la estructura y los datos del borrador reci\u00e9n le\u00eddo.
 * Reutiliza los esquemas zod del formulario; si algo no encaja, se descarta.
 */
function isValidAddTourDraft(draft: unknown): draft is AddTourDraftStored {
  if (!isRecord(draft)) return false;
  if (
    typeof draft.step !== "number" ||
    !Number.isInteger(draft.step) ||
    draft.step < 1 ||
    draft.step > 5
  ) {
    return false;
  }
  const step = draft.step;
  if (typeof draft.savedAt !== "number" || !Number.isFinite(draft.savedAt)) {
    return false;
  }
  const ageMs = Date.now() - draft.savedAt;
  if (ageMs < 0 || ageMs > ADD_TOUR_DRAFT_MAX_AGE_MS) {
    return false;
  }

  // Secciones obligatorias seg\u00fan el paso alcanzado.
  if (step >= 2 && !getBasicInfoSchema(silentT).safeParse(draft.basicInfo).success) {
    return false;
  }
  if (step >= 3 && !getLocationSchema(silentT).safeParse(draft.location).success) {
    return false;
  }
  if (step >= 4 && !isValidDraftDetails(draft.details)) {
    return false;
  }
  if (step >= 5 && !getCategorizationSchema(silentT).safeParse(draft.categorization).success) {
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

function isValidDraftDetails(details: unknown): boolean {
  if (!isRecord(details)) return false;
  const storedDates = details.available_dates;
  if (!isValidIsoDateList(storedDates)) return false;
  // Valida contra el esquema del paso 3 convirtiendo las fechas ISO a Date.
  const asDates = storedDates.map((d) => new Date(d));
  return getDetailsSchema(silentT).safeParse({
    ...details,
    available_dates: asDates,
  }).success;
}

export function getAddTourDraft(
  userId: string,
  typeId: string,
): AddTourDraftStored | null {
  if (typeof window === "undefined") return null;
  const key = getAddTourDraftKey(userId, typeId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidAddTourDraft(parsed)) {
      // Caducado o corrupto: se descarta para no restaurar datos inv\u00e1lidos.
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Borrador listo para el formulario (fechas como Date) */
export interface AddTourDraftRestored {
  step: number;
  basicInfo: BasicInfoFormValues | null;
  location: LocationFormValues | null;
  details: DetailsFormValues | null;
  categorization: CategorizationFormValues | null;
  multimedia: MultimediaFormValues | null;
}

/** Convierte el borrador guardado a valores listos para el formulario (fechas como Date) */
export function getAddTourDraftForForm(
  userId: string,
  typeId: string,
): AddTourDraftRestored | null {
  const draft = getAddTourDraft(userId, typeId);
  if (!draft) return null;
  const details = draft.details
    ? {
        ...draft.details,
        difficulty: normalizeTourDifficultyForForm(draft.details.difficulty),
        available_dates: draft.details.available_dates.map(
          (d) => new Date(d)
        ) as DetailsFormValues["available_dates"],
      }
    : null;
  return {
    step: draft.step,
    basicInfo: draft.basicInfo,
    location: draft.location,
    details,
    categorization: draft.categorization,
    multimedia: draft.multimedia,
  };
}

export function setAddTourDraft(
  draft: Omit<AddTourDraftStored, "savedAt">,
  userId: string,
  typeId: string,
): void {
  if (typeof window === "undefined") return;
  const key = getAddTourDraftKey(userId, typeId);
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ ...draft, savedAt: Date.now() } satisfies AddTourDraftStored),
    );
  } catch {
    // quota or disabled
  }
}

export function clearAddTourDraft(userId: string, typeId: string): void {
  if (typeof window === "undefined") return;
  const key = getAddTourDraftKey(userId, typeId);
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Clave a nivel de día para emparejar fechas sin depender de la hora. */
function tourDateDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Empareja las fechas elegidas en el paso 3 con las filas de tourDatesMeta
 * por identidad (id del backend / misma fecha), NO por posición: cada fila
 * conserva su id solo si su fecha sigue existiendo. Las fechas nuevas crean
 * filas con id vacío (el backend las inserta) y las eliminadas quedan fuera
 * del payload (el backend las borra, y falla si tienen reservas).
 */
export function pairTourDatesMetaWithDates(
  dates: Date[],
  meta: readonly TourDateMetaRow[],
  fallback: {
    price: number;
    childrenPrice: number | null;
    maxPeople: number;
  },
): TourDateMetaRow[] {
  const rowsByDay = new Map<string, TourDateMetaRow[]>();
  for (const row of meta) {
    const parsed = new Date(row.date);
    if (Number.isNaN(parsed.getTime())) continue;
    const key = tourDateDayKey(parsed);
    const list = rowsByDay.get(key);
    if (list) {
      list.push(row);
    } else {
      rowsByDay.set(key, [row]);
    }
  }

  const usedIds = new Set<string>();
  return dates.map((date) => {
    const candidates = rowsByDay.get(tourDateDayKey(date));
    const row = candidates?.find(
      (candidate) => !candidate.id || !usedIds.has(candidate.id),
    );
    if (row) {
      if (row.id) usedIds.add(row.id);
      return { ...row, date: date.toISOString() };
    }
    return {
      id: "",
      date: date.toISOString(),
      price: fallback.price,
      children_price: fallback.childrenPrice,
      max_people: fallback.maxPeople,
      status: "active",
    };
  });
}

function readBackendErrorMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;
  return typeof data.message === "string" && data.message.trim()
    ? data.message.trim()
    : undefined;
}

export interface TourSaveErrorInfo {
  title: string;
  description?: string;
}

/**
 * Convierte un error de RTK Query (FetchBaseQueryError / SerializedError)
 * en textos de toast, distinguiendo red, auth, tamaño de carga, validación
 * del backend (con su mensaje) y errores 5xx.
 */
export function getTourSaveErrorInfo(
  error: unknown,
  t: TFunction,
  isEdit: boolean,
): TourSaveErrorInfo {
  const genericTitle = isEdit
    ? t("dashboard.addTour.toast.updateError")
    : t("dashboard.addTour.toast.error");
  const genericDescription = isEdit
    ? t("dashboard.addTour.toast.updateErrorDescription")
    : t("dashboard.addTour.toast.errorDescription");

  if (!isRecord(error)) {
    return { title: genericTitle, description: genericDescription };
  }

  // La petición nunca llegó al servidor (sin conexión, proxy, timeout…).
  if (error.status === "FETCH_ERROR") {
    return {
      title: t("dashboard.addTour.toast.networkError"),
      description: t("dashboard.addTour.toast.networkErrorDescription"),
    };
  }

  const status = typeof error.status === "number" ? error.status : NaN;

  if (status === 413) {
    return {
      title: t("dashboard.addTour.toast.payloadTooLarge"),
      description: t("dashboard.addTour.toast.payloadTooLargeDescription"),
    };
  }

  if (status === 401 || status === 403) {
    const key = status === 401 ? "authError" : "forbiddenError";
    return {
      title: t(`dashboard.addTour.toast.${key}`),
      description:
        readBackendErrorMessage(error.data) ?? t(`dashboard.addTour.toast.${key}Description`),
    };
  }

  if (status === 400 || status === 422) {
    return {
      title: genericTitle,
      description: readBackendErrorMessage(error.data) ?? genericDescription,
    };
  }

  if (status >= 500) {
    return {
      title: t("dashboard.addTour.toast.serverError"),
      description: t("dashboard.addTour.toast.serverErrorDescription"),
    };
  }

  return { title: genericTitle, description: genericDescription };
}

// Función para calcular precios
export const calculatePrices = (basePrice: number) => {
  const tourismTax = basePrice * 0.05; // 5% impuesto de turismo
  const platformFee = basePrice * 0.1; // 10% comisión de plataforma
  const totalDeductions = tourismTax + platformFee;
  const sellerEarns = basePrice - totalDeductions;
  const userPays = basePrice;

  return {
    tourismTax,
    platformFee,
    totalDeductions,
    sellerEarns,
    userPays,
  };
};

function isVisibleForFocus(el: HTMLElement): boolean {
  if (el.hasAttribute("disabled")) return false;
  if (el.closest(".hidden")) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return true;
}

/**
 * Scrolls to and focuses the first visible field in a step form (text/number inputs,
 * textarea, select, combobox trigger). Skips hidden file inputs. Retries Google Maps
 * PlaceAutocomplete when it mounts asynchronously.
 */
export function focusFirstStepField(
  root: HTMLElement | null | undefined,
  options?: { delayMs?: number }
): void {
  if (typeof window === "undefined" || !root) return;
  const delayMs = options?.delayMs ?? 100;

  const run = (): boolean => {
    const selector = [
      'input:not([type="hidden"]):not([type="file"])',
      "textarea",
      "select",
      'button[role="combobox"]',
    ].join(", ");
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
    for (const el of nodes) {
      if (!isVisibleForFocus(el)) continue;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
      return true;
    }
    const place = root.querySelector<HTMLElement>("#place-autocomplete-input");
    if (place) {
      place.scrollIntoView({ block: "center", behavior: "smooth" });
      try {
        place.focus({ preventScroll: true });
      } catch {
        place.focus();
      }
      return true;
    }
    return false;
  };

  window.setTimeout(() => {
    if (run()) return;
    window.setTimeout(() => {
      if (run()) return;
      root.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 400);
  }, delayMs);
}

// Función para hacer scroll al primer error
// eslint-disable-next-line @typescript-eslint/no-explicit-any

/**
 * Busca el elemento visible asociado a un campo de error (por name de RHF
 * o por el atributo data-error-field) dentro de root (o todo el documento).
 */
function findErrorFieldTarget(
  root: HTMLElement | null,
  key: string,
): HTMLElement | null {
  const searchRoot: ParentNode = root ?? document;
  const named = searchRoot.querySelector<HTMLElement>(`[name="${key}"]`);
  if (named && isVisibleForFocus(named)) return named;
  const marked = searchRoot.querySelector<HTMLElement>(
    `[data-error-field="${key}"]`,
  );
  if (marked && isVisibleForFocus(marked)) return marked;
  return null;
}

/** Scroll al campo del error y foco en su control (o su primer control interno). */
function focusErrorTarget(target: HTMLElement): void {
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable = target.matches(
    'input, textarea, select, button, [role="combobox"]',
  )
    ? target
    : target.querySelector<HTMLElement>(
        'input, textarea, select, button, [role="combobox"]',
      );
  try {
    (focusable ?? target).focus({ preventScroll: true });
  } catch {
    // ignore
  }
}

/** Scroll + foco al campo de un error (usado por el resumen de errores). */
export function scrollToErrorField(key: string): void {
  const target = findErrorFieldTarget(null, key);
  if (target) focusErrorTarget(target);
}

export const scrollToFirstError = (
  errors: Record<string, unknown>,
  root?: HTMLElement | null,
) => {
  const keys = Object.keys(errors);
  if (keys.length > 0) {
    for (const key of keys) {
      const target = findErrorFieldTarget(root ?? null, key);
      if (target) {
        focusErrorTarget(target);
        return;
      }
    }
    // Ningún error tiene elemento visible: enfocar el primer campo del formulario.
    if (root) focusFirstStepField(root, { delayMs: 0 });
  }
};

const MAX_BANNER_MB = 5;
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;
const MAX_PDF_MB = 10;

export type ValidateFilesOptions = {
  /** Si ya hay banner en el producto (edición), no exige subir uno nuevo. */
  existingBannerUrl?: string;
  /** Imágenes ya guardadas en el producto (edición). */
  existingImageCount?: number;
};

/** Validates tour files and returns translated error messages. */
export function validateFiles(
  t: TFunction,
  bannerFile: File | null,
  imageFiles: File[],
  videoFiles: File[],
  fileAttachments: File[],
  options?: ValidateFilesOptions
): string[] {
  const errors: string[] = [];

  const hasBanner = Boolean(bannerFile || options?.existingBannerUrl);
  if (!hasBanner) {
    errors.push(t("dashboard.addTour.multimedia.validation.bannerRequired"));
  }

  const existingImageCount = options?.existingImageCount ?? 0;
  const totalImages = imageFiles.length + existingImageCount;
  if (totalImages < 5) {
    errors.push(t("dashboard.addTour.multimedia.validation.imagesMin"));
  }

  if (totalImages > 10) {
    errors.push(t("dashboard.addTour.multimedia.validation.imagesMax"));
  }

  const bannerMaxBytes = MAX_BANNER_MB * 1024 * 1024;
  if (bannerFile && bannerFile.size > bannerMaxBytes) {
    errors.push(
      t("dashboard.addTour.multimedia.validation.bannerMaxSize").replace(
        "{{max}}",
        String(MAX_BANNER_MB)
      )
    );
  }

  const imageMaxBytes = MAX_IMAGE_MB * 1024 * 1024;
  const oversizedImages = imageFiles.filter((file) => file.size > imageMaxBytes);
  if (oversizedImages.length > 0) {
    errors.push(
      t("dashboard.addTour.multimedia.validation.imagesMaxSize").replace(
        "{{max}}",
        String(MAX_IMAGE_MB)
      )
    );
  }

  const videoMaxBytes = MAX_VIDEO_MB * 1024 * 1024;
  const oversizedVideos = videoFiles.filter((file) => file.size > videoMaxBytes);
  if (oversizedVideos.length > 0) {
    errors.push(
      t("dashboard.addTour.multimedia.validation.videosMaxSize").replace(
        "{{max}}",
        String(MAX_VIDEO_MB)
      )
    );
  }

  const fileMaxBytes = MAX_PDF_MB * 1024 * 1024;
  const oversizedFiles = fileAttachments.filter((file) => file.size > fileMaxBytes);
  if (oversizedFiles.length > 0) {
    errors.push(
      t("dashboard.addTour.multimedia.validation.filesMaxSize").replace(
        "{{max}}",
        String(MAX_PDF_MB)
      )
    );
  }

  return errors;
}

/** Formats a date using the given locale (e.g. "es", "en"). */
export function formatDate(date: Date, locale: string = "es"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
