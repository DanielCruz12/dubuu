/**
 * Idiomas ofrecidos en el perfil público del operador (etiquetas enviadas al API en `idiomas: string[]`).
 * Ampliar aquí si el backend acepta más valores.
 */
export const HOST_PROFILE_LANGUAGES = [
  { code: "es", label: "Español", flag: "🇦🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
] as const;

export type HostProfileLanguageCode = (typeof HOST_PROFILE_LANGUAGES)[number]["code"];

/** Normaliza texto del API o entrada libre al `label` canónico si coincide. */
export function canonicalHostLanguageLabel(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  if (!t) return null;
  for (const row of HOST_PROFILE_LANGUAGES) {
    if (row.label.toLowerCase() === t) return row.label;
    if (row.code === t) return row.label;
  }
  const aliases: Record<string, string> = {
    español: "Español",
    spanish: "Español",
    castellano: "Español",
    ingles: "English",
    inglés: "English",
    inglesh: "English",
    english: "English",
    frances: "Français",
    français: "Français",
    french: "Français",
    italiano: "Italiano",
    italian: "Italiano",
    portugues: "Português",
    português: "Português",
    portuguese: "Português",
    aleman: "Deutsch",
    alemán: "Deutsch",
    german: "Deutsch",
    deutsch: "Deutsch",
  };
  const mapped = aliases[t];
  if (mapped) return mapped;
  return null;
}

/** Lista de etiquetas para el formulario a partir del perfil API. */
export function hostLanguagesFromProfile(apiList: string[] | undefined): string[] {
  if (!apiList?.length) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of apiList) {
    const c = canonicalHostLanguageLabel(raw);
    const label = c ?? raw.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c ?? raw.trim());
  }
  return out;
}
