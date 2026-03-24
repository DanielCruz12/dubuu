import type {
  BasicInfoFormValues,
  LocationFormValues,
  DetailsFormValues,
  CategorizationFormValues,
  MultimediaFormValues,
} from "./types";

const ADD_TOUR_DRAFT_KEY = "dubuu-add-tour-draft";

/** Borrador serializable para localStorage (fechas como ISO string) */
export interface AddTourDraftStored {
  step: number;
  basicInfo: BasicInfoFormValues | null;
  location: LocationFormValues | null;
  details: DetailsFormValuesStored | null;
  categorization: CategorizationFormValues | null;
  multimedia: MultimediaFormValues | null;
}

interface DetailsFormValuesStored
  extends Omit<DetailsFormValues, "available_dates"> {
  available_dates: string[];
}

export function getAddTourDraft(): AddTourDraftStored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADD_TOUR_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AddTourDraftStored;
    if (!parsed || typeof parsed.step !== "number") return null;
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
export function getAddTourDraftForForm(): AddTourDraftRestored | null {
  const draft = getAddTourDraft();
  if (!draft) return null;
  const details = draft.details
    ? {
        ...draft.details,
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

export function setAddTourDraft(draft: AddTourDraftStored): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADD_TOUR_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // quota or disabled
  }
}

export function clearAddTourDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADD_TOUR_DRAFT_KEY);
  } catch {
    // ignore
  }
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
export const scrollToFirstError = (errors: Record<string, any>) => {
  if (Object.keys(errors).length > 0) {
    const firstErrorKey = Object.keys(errors)[0];
    const element = document.querySelector(
      `[name="${firstErrorKey}"], [id="${firstErrorKey}"]`
    );
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

type TFunction = (key: string) => string;

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
