import type {
  HostProfileDetail,
  HostProfileDetailKey,
  HostPublicProfile,
} from "@/types/host-profile";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function str(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return fallback;
}

function nullableStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function normalizeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : String(x)))
    .map((s) => s.trim())
    .filter(Boolean);
}

function isDetailKey(k: string): k is HostProfileDetailKey {
  return k === "specialty" || k === "experience_types" || k === "style";
}

function normalizeDetalles(v: unknown): HostProfileDetail[] {
  if (!Array.isArray(v)) return [];
  const out: HostProfileDetail[] = [];
  for (const item of v) {
    const r = asRecord(item);
    if (!r) continue;
    const key = str(r.key).trim();
    if (!isDetailKey(key)) continue;
    out.push({
      key,
      label: str(r.label),
      value: str(r.value),
    });
  }
  return out;
}

function pickRecord(rec: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (!(k in rec)) continue;
    const v = rec[k];
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && !v.trim()) continue;
    return v;
  }
  return undefined;
}

/**
 * Unifica GET/PATCH cuando el backend devuelve snake_case u otros alias.
 */
export function normalizeHostPublicProfile(raw: unknown): HostPublicProfile {
  const r = asRecord(raw) ?? {};
  const pick = (...keys: string[]) => pickRecord(r, ...keys);

  const imageKeys = [
    "imageUrl",
    "image_url",
    "avatarUrl",
    "avatar_url",
    "profileImageUrl",
    "profile_image_url",
    "photoUrl",
    "photo_url",
    "profile_image",
  ] as const;

  let imageUrl = nullableStr(pick(...imageKeys)) ?? null;
  if (!imageUrl) {
    const nestedUser = asRecord(pickRecord(r, "user"));
    if (nestedUser) {
      imageUrl = nullableStr(pickRecord(nestedUser, ...imageKeys)) ?? null;
    }
  }

  return {
    userId: str(pick("userId", "user_id"), ""),
    username: str(pick("username"), ""),
    firstName: str(pick("firstName", "first_name"), ""),
    lastName: str(pick("lastName", "last_name"), ""),
    imageUrl,
    calificacion: nullableStr(pick("calificacion", "rating", "average_rating")),
    totalEvaluaciones: num(pick("totalEvaluaciones", "total_evaluaciones"), 0),
    totalTours: num(pick("totalTours", "total_tours"), 0),
    anosExperiencia: num(
      pick("anosExperiencia", "anos_experiencia", "years_experience"),
      0,
    ),
    intro: str(pick("intro"), ""),
    descripcion: str(pick("descripcion", "description"), ""),
    detalles: (() => {
      const d = normalizeDetalles(pick("detalles", "details"));
      if (d.length) return d;

      // Nuevo formato backend: campos planos (snake_case).
      const specialty = str(pick("specialty"), "").trim();
      const expSummary = str(pick("experience_summary"), "").trim();
      const hostingStyle = str(pick("hosting_style"), "").trim();
      const out: HostProfileDetail[] = [];
      if (specialty) {
        out.push({ key: "specialty", label: "Especialidad", value: specialty });
      }
      if (expSummary) {
        out.push({
          key: "experience_types",
          label: "Tipo de experiencias",
          value: expSummary,
        });
      }
      if (hostingStyle) {
        out.push({ key: "style", label: "Estilo", value: hostingStyle });
      }
      return out;
    })(),
    tiposExperiencia: normalizeStringArray(
      pick("tiposExperiencia", "tipos_experiencia", "experience_tags"),
    ),
    idiomas: normalizeStringArray(pick("idiomas", "languages")),
  };
}

