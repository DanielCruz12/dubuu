export type AiConfidenceLevel = "high" | "medium" | "low";
export type AiFieldKey =
  | "brand"
  | "model"
  | "year"
  | "color"
  | "transmission"
  | "fuel_type"
  | "seating_capacity"
  | "engine"
  | "condition"
  | "name"
  | "description"
  | "price_per_day";

export interface AiVehicleSuggestion {
  brand: string | null;
  model: string | null;
  year: number | null;
  color: "red" | "white" | "blue" | "black" | "green" | "yellow" | "gray" | null;
  transmission: "automatic" | "manual" | null;
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid" | null;
  seating_capacity: number | null;
  condition: "new" | "used" | "refurbished" | null;
  engine: string | null;
  name: string | null;
  description: string | null;
  price_per_day: number | null;
  price_min?: number | null;
  price_max?: number | null;
}

export interface AiAnalyzeResponse {
  data: AiVehicleSuggestion;
  confidence: Record<AiFieldKey, AiConfidenceLevel | number>;
  imageUrl: string;
  imageKey?: string;
  remainingUses?: number;
}

// --- helpers de confianza ---

export function normalizeConfidence(value: AiConfidenceLevel | number | undefined): AiConfidenceLevel | null {
  if (value == null) return null;
  if (typeof value === "number") {
    if (value >= 0.75) return "high";
    if (value >= 0.45) return "medium";
    return "low";
  }
  return value;
}

export function isMissing(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (typeof value === "number" && !Number.isFinite(value)) return true;
  return false;
}

// --- valores listos para publicar (flujo de un clic, sin formulario editable) ---
export interface AiResultFormValues {
  name: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  color: "red" | "white" | "blue" | "black" | "green" | "yellow" | "gray";
  transmission: "automatic" | "manual";
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid";
  seating_capacity: number;
  engine: string;
  condition: "new" | "used" | "refurbished";
  price_per_day: number;
}

export interface AiEnhanceResponse {
  bannerUrl: string;
  socialUrl: string;
  gallery: { view: string; url: string }[];
  aiGenerated: boolean;
  remainingUses?: number;
}

export interface AiEnhanceJobStatus {
  status: "processing" | "done" | "error";
  bannerUrl?: string;
  socialUrl?: string;
  gallery?: { view: string; url: string }[];
  aiGenerated?: boolean;
  remainingUses?: number;
  code?: string;
  message?: string;
}

export type AiLocale = "es" | "en";

export function overallConfidenceLevel(
  conf: Record<AiFieldKey, AiConfidenceLevel | number>,
): AiConfidenceLevel {
  const levels = (Object.keys(conf) as AiFieldKey[]).map(
    (k) => normalizeConfidence(conf[k]) ?? "low",
  );
  const highs = levels.filter((l) => l === "high").length;
  const lows = levels.filter((l) => l === "low").length;
  if (highs >= 8) return "high";
  if (lows >= 6) return "low";
  return "medium";
}

// --- valores listos para publicar (el usuario no llena nada) ---

export interface PublishReadyData {
  values: AiResultFormValues;
  /** Claves de `fields.*` autocompletadas (la IA no dedujo esos campos). */
  autoFilled: string[];
}

/**
 * Convierte la sugerencia de la IA en valores válidos para publicar en un
 * clic: usa el mejor dato de la IA y completa lo faltante con valores
 * temporales neutros en el idioma indicado (el borrador queda oculto y editable).
 */
export function suggestionToPublishValues(
  s: AiVehicleSuggestion,
  locale: AiLocale = "es",
): PublishReadyData {
  const en = locale === "en";
  const pending = en ? "To confirm" : "Por confirmar";
  const autoFilled: string[] = [];
  const missing = (key: string) => {
    autoFilled.push(key);
  };
  const text = (key: string, v: string | null): string => {
    const t = v?.trim() ?? "";
    if (!t) {
      missing(key);
      return pending;
    }
    return t;
  };

  const brand = text("brand", s.brand);
  const model = text("model", s.model);
  const yearNow = new Date().getFullYear();
  if (!s.year) missing("year");
  if (!s.seating_capacity) missing("seating");
  if (!s.price_per_day) missing("price");

  let name = s.name?.trim() ?? "";
  if (!name) {
    missing("name");
    const suffix = en ? "for rent" : "en alquiler";
    const fallbackName = en ? "Vehicle for rent" : "Vehículo en alquiler";
    name =
      brand !== pending || model !== pending
        ? `${brand} ${model} ${suffix}`.replace(new RegExp(pending, "g"), "").replace(/\s+/g, " ").trim() ||
          fallbackName
        : fallbackName;
  }
  let description = s.description?.trim() ?? "";
  if (!description) {
    missing("description");
    description = en
      ? `Vehicle available for rent in El Salvador.` +
        (brand !== pending ? ` ${brand} ${model !== pending ? model : ""}.`.replace(/\s+\./, ".") : "") +
        ` Contact the host for more details.`
      : `Vehículo disponible para alquiler en El Salvador.` +
        (brand !== pending ? ` ${brand} ${model !== pending ? model : ""}.`.replace(/\s+\./, ".") : "") +
        ` Contacta al anfitrión para más detalles.`;
  }

  if (!s.color) missing("color");
  if (!s.transmission) missing("transmission");
  if (!s.fuel_type) missing("fuel");
  if (!s.engine?.trim()) missing("engine");
  if (!s.condition) missing("condition");

  return {
    values: {
      name,
      description,
      brand,
      model,
      year: s.year ?? yearNow,
      color: (s.color ?? "white") as AiResultFormValues["color"],
      transmission: (s.transmission ?? "automatic") as AiResultFormValues["transmission"],
      fuel_type: (s.fuel_type ?? "gasoline") as AiResultFormValues["fuel_type"],
      seating_capacity: s.seating_capacity ?? 5,
      engine: s.engine?.trim() || pending,
      condition: (s.condition ?? "used") as AiResultFormValues["condition"],
      price_per_day: s.price_per_day ?? 35,
    },
    autoFilled,
  };
}
