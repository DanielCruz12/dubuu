import type {
  HostProfileApiErrorBody,
  HostProfileDetail,
  HostProfileDetailKey,
  HostProfilePatchBody,
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

function pickRecord(
  rec: Record<string, unknown>,
  ...keys: string[]
): unknown {
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

function trimTrailingSlash(s: string) {
  return s.replace(/\/$/, "");
}

/**
 * URL absoluta `/api/v1/...` para usar en `fetch` desde el navegador o el servidor.
 * - Cliente: `NEXT_PUBLIC_API_URL` si existe; si no, rewrite `/backend/api/v1/...`.
 * - Servidor: misma env o `BACKEND_URL` / localhost por defecto.
 */
export function apiV1AbsoluteUrl(pathWithinV1: string): string {
  const part = pathWithinV1.startsWith("/")
    ? pathWithinV1
    : `/${pathWithinV1}`;

  const publicBase = process.env.NEXT_PUBLIC_API_URL
    ? trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL)
    : "";

  if (typeof window !== "undefined") {
    if (publicBase) return `${publicBase}/api/v1${part}`;
    return `/backend/api/v1${part}`;
  }

  const serverBase =
    publicBase ||
    trimTrailingSlash(
      process.env.BACKEND_URL?.trim() || "http://localhost:3002",
    );
  return `${serverBase}/api/v1${part}`;
}

export function hostPublicProfileUrl(userId: string): string {
  return apiV1AbsoluteUrl(
    `/hosts/${encodeURIComponent(userId)}/profile`,
  );
}

function withLocale(url: string, locale?: string): string {
  const l = (locale ?? "").trim();
  if (!l) return url;
  const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  u.searchParams.set("locale", l);
  return u.toString();
}

export function hostAuthenticatedProfileUrl(): string {
  return apiV1AbsoluteUrl("/hosts/profile");
}

export async function readApiErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as Partial<HostProfileApiErrorBody>;
    if (body?.message && typeof body.message === "string") {
      return body.message;
    }
  } catch {
    /* ignore */
  }
  return `Error HTTP ${res.status}`;
}

export async function fetchHostPublicProfile(
  userId: string,
  locale: string,
  init?: RequestInit,
): Promise<HostPublicProfile> {
  const res = await fetch(withLocale(hostPublicProfileUrl(userId), locale), {
    ...init,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: init?.cache ?? "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const json: unknown = await res.json();
  return normalizeHostPublicProfile(json);
}

export async function patchHostProfile(
  token: string,
  body: HostProfilePatchBody,
  init?: RequestInit,
): Promise<HostPublicProfile> {
  const res = await fetch(hostAuthenticatedProfileUrl(), {
    ...init,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const json: unknown = await res.json();
  return normalizeHostPublicProfile(json);
}
