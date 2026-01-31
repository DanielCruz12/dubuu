/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Language = "es" | "en";

interface Translations {
  [key: string]: any;
}

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [translations, setTranslations] = useState<Translations>({});

  // Cargar idioma desde localStorage al montar
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Cargar traducciones dinámicamente
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const data = await import(`@/locales/${language}.json`);
        setTranslations(data.default || data);
      } catch (error) {
        console.error(`Error loading translations for ${language}:`, error);
        // Fallback al idioma por defecto
        const fallback = await import(`@/locales/es.json`);
        setTranslations(fallback.default || fallback);
      }
    };

    loadTranslations();
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback((path: string): string => {
    const keys = path.split(".");
    let value: any = translations;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) {
        console.warn(`Translation missing for key: ${path}`);
        return path;
      }
    }

    return typeof value === "string" ? value : path;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage, t }}>
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

