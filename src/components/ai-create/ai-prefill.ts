import { AI_PREFILL_KEY_PREFIX, AI_PREFILL_TTL_MS } from "./ai-constants";
import type { AiVehicleSuggestion } from "./ai-types";

export interface AiPrefillPayload {
  suggestion: AiVehicleSuggestion;
  imageUrl: string;
  imagePreview?: string; // data url for local preview
  savedAt: number;
}

function keyFor(userId: string, typeId: string) {
  return `${AI_PREFILL_KEY_PREFIX}:${userId || "anon"}:${typeId || "rental"}`;
}

export function setAiPrefill(userId: string, typeId: string, payload: Omit<AiPrefillPayload, "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      keyFor(userId, typeId),
      JSON.stringify({ ...payload, savedAt: Date.now() }),
    );
  } catch {}
}

export function getAiPrefill(userId: string, typeId: string): AiPrefillPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyFor(userId, typeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AiPrefillPayload;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > AI_PREFILL_TTL_MS) {
      localStorage.removeItem(keyFor(userId, typeId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearAiPrefill(userId: string, typeId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(keyFor(userId, typeId));
  } catch {}
}
