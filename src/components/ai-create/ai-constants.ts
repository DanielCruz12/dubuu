// Constantes para el flujo Crear con IA — alquiler de vehículos
export const AI_MAX_IMAGE_MB = 10;

export const AI_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

// Prefill para "Editar antes de publicar"
export const AI_PREFILL_KEY_PREFIX = "dubuu:ai-prefill";
export const AI_PREFILL_TTL_MS = 30 * 60 * 1000; // 30 min
