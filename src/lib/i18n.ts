/**
 * i18n modular: carga de traducciones por namespace según la ruta.
 * No se cargan todas las traducciones a la vez; solo las necesarias para la página actual.
 */

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const translationCache = new Map<string, Record<string, unknown>>();

function getCacheKey(locale: SupportedLanguage, namespace: string): string {
  return `${locale}-${namespace}`;
}

/**
 * Obtiene el locale inicial (localStorage o navegador).
 * Por defecto: español (es).
 */
export function getInitialLocale(): SupportedLanguage {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem("language") as SupportedLanguage | null;
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  const browserLang = navigator.language?.split("-")[0];
  if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage;
  }
  return "es";
}

/**
 * Carga un namespace para un locale (con cache).
 */
export async function loadNamespace(
  locale: SupportedLanguage,
  namespace: string
): Promise<Record<string, unknown>> {
  const cacheKey = getCacheKey(locale, namespace);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  try {
    const response = await fetch(`/locales/${locale}/${namespace}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = (await response.json()) as Record<string, unknown>;
    translationCache.set(cacheKey, data);
    return data;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] Failed to load ${locale}/${namespace}:`, err);
    }
    return {};
  }
}

/**
 * Carga varios namespaces a la vez.
 */
export async function loadNamespaces(
  locale: SupportedLanguage,
  namespaces: string[]
): Promise<Record<string, unknown>[]> {
  const results = await Promise.all(
    namespaces.map((ns) => loadNamespace(locale, ns))
  );
  return results;
}

/**
 * Mapeo ruta → namespaces a cargar para esa ruta.
 * Solo se cargan los namespaces necesarios por página.
 */
export function getNamespacesForRoute(pathname: string): string[] {
  const namespaces: string[] = ["common", "footer"];
  if (!pathname || pathname === "/" || pathname.startsWith("/home")) {
    namespaces.push("home", "filters", "menu");
  }
  if (pathname.includes("/dashboard") || pathname.includes("/account")) {
    namespaces.push("menu", "home", "dashboard");
  }
  if (pathname.includes("/contact")) {
    namespaces.push("menu", "contact");
  }
  if (pathname.includes("/terms")) {
    namespaces.push("terms");
  }
  return namespaces.filter((ns, i) => namespaces.indexOf(ns) === i);
}

/**
 * Carga las traducciones necesarias para la ruta actual y las devuelve
 * ya fusionadas en un solo objeto (igual que antes: common.*, home.*, etc.).
 */
export async function loadTranslationsForRoute(
  locale: SupportedLanguage,
  pathname: string
): Promise<Record<string, unknown>> {
  const namespaces = getNamespacesForRoute(pathname);
  const loaded = await loadNamespaces(locale, namespaces);
  const merged: Record<string, unknown> = {};
  namespaces.forEach((ns, i) => {
    merged[ns] = loaded[i] ?? {};
  });
  return merged;
}

/**
 * Precarga namespaces en segundo plano (para navegación más fluida).
 */
export function preloadTranslations(
  locale: SupportedLanguage,
  namespaces: string[]
): void {
  if (typeof window === "undefined") return;
  const run = () => {
    namespaces.forEach((ns) => loadNamespace(locale, ns));
  };
  if ("requestIdleCallback" in window) {
    (window as Window).requestIdleCallback(run, { timeout: 1000 });
  } else {
    setTimeout(run, 100);
  }
}
