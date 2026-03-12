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

// Función para validar archivos
export const validateFiles = (
  bannerFile: File | null,
  imageFiles: File[],
  videoFiles: File[],
  fileAttachments: File[]
) => {
  const errors: string[] = [];

  // Validar banner
  if (!bannerFile) {
    errors.push("Debe subir una imagen de banner");
  }

  // Validar imágenes (mínimo 5, máximo 10)
  if (imageFiles.length < 5) {
    errors.push("Debe subir al menos 5 imágenes");
  }

  if (imageFiles.length > 10) {
    errors.push("No puede subir más de 10 imágenes");
  }

  // Validar tamaño máximo de archivos
  const maxSizeMB = 5; // 5MB
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (bannerFile && bannerFile.size > maxSizeBytes) {
    errors.push(`El banner no debe exceder ${maxSizeMB}MB`);
  }

  const oversizedImages = imageFiles.filter((file) => file.size > maxSizeBytes);
  if (oversizedImages.length > 0) {
    errors.push(`Algunas imágenes exceden el tamaño máximo de ${maxSizeMB}MB`);
  }

  const oversizedVideos = videoFiles.filter(
    (file) => file.size > maxSizeBytes * 10
  ); // 50MB para videos
  if (oversizedVideos.length > 0) {
    errors.push(
      `Algunos videos exceden el tamaño máximo de ${maxSizeMB * 10}MB`
    );
  }

  const oversizedFiles = fileAttachments.filter(
    (file) => file.size > maxSizeBytes * 2
  ); // 10MB para archivos
  if (oversizedFiles.length > 0) {
    errors.push(
      `Algunos archivos exceden el tamaño máximo de ${maxSizeMB * 2}MB`
    );
  }

  return errors;
};

// Función para formatear fecha
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
