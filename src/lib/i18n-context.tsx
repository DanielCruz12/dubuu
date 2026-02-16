/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import {
  getInitialLocale,
  loadTranslationsForRoute,
  getNamespacesForRoute,
  preloadTranslations,
  type SupportedLanguage,
} from "@/lib/i18n";

export type Language = SupportedLanguage;

interface Translations {
  [key: string]: any;
}

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>("es");
  const [localeHydrated, setLocaleHydrated] = useState(false);
  const [translations, setTranslations] = useState<Translations>({});
  const [isReady, setIsReady] = useState(false);
  const loadedRouteRef = useRef<string | null>(null);

  // Leer idioma guardado en localStorage nada más montar (cliente). Así la carga
  // de traducciones usa el idioma correcto y no se carga inglés primero.
  useEffect(() => {
    setLanguageState(getInitialLocale());
    setLocaleHydrated(true);
  }, []);

  // Cargar traducciones por ruta solo cuando ya sabemos el idioma real (evita race con "en").
  useEffect(() => {
    if (typeof window === "undefined" || !localeHydrated) return;
    const route = pathname ?? "/";
    const load = async () => {
      setIsReady(false);
      try {
        const merged = await loadTranslationsForRoute(language, route);
        setTranslations(merged as Translations);
        loadedRouteRef.current = `${language}:${route}`;
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[i18n] loadTranslationsForRoute failed:", e);
        }
      } finally {
        setIsReady(true);
      }
    };
    const key = `${language}:${route}`;
    if (loadedRouteRef.current !== key) {
      load();
    }
  }, [language, pathname, localeHydrated]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    loadedRouteRef.current = null; // forzar recarga de namespaces para el nuevo idioma
  }, []);

  const t = useCallback(
    (path: string): string => {
      // Mientras las traducciones no estén cargadas, no mostrar la key (evita flash de "home.hero.subtitle" etc.)
      if (!isReady || Object.keys(translations).length === 0) {
        return "\u00A0"; // espacio no separable para no colapsar el layout
      }
      const keys = path.split(".");
      let value: any = translations;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`Translation missing for key: ${path}`);
          }
          return path;
        }
      }
      return typeof value === "string" ? value : path;
    },
    [translations, isReady]
  );

  // Precarga namespaces de la ruta actual para el otro idioma (mejor UX al cambiar idioma)
  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;
    const otherLocale: Language = language === "es" ? "en" : "es";
    const namespaces = getNamespacesForRoute(pathname);
    preloadTranslations(otherLocale, namespaces);
  }, [language, pathname]);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
