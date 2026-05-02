import { countries } from "@/utils/data";
import type { SupportedLanguage } from "@/lib/i18n";

/** Opciones para selects de país: etiqueta según locale (ISO 3166-1 alpha-2 en `id`). */
export function getCountrySelectOptions(language: SupportedLanguage): { id: string; label: string }[] {
  const localeTag = language === "en" ? "en" : "es";
  try {
    const dn = new Intl.DisplayNames([localeTag], { type: "region" });
    return [...countries]
      .map((c) => ({
        id: c.id,
        label: dn.of(c.id) ?? c.nombre,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, localeTag));
  } catch {
    return [...countries]
      .sort((a, b) => a.orden - b.orden)
      .map((c) => ({ id: c.id, label: c.nombre }));
  }
}
