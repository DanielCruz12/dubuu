"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useLanguage } from "@/lib/i18n-context";

// Ticker compartido: un solo intervalo de 30s para todas las horas relativas
// de la pantalla (evita un timer por cada burbuja).
const TICK_MS = 30_000;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot(): number {
  return Math.floor(Date.now() / TICK_MS);
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * Hora relativa ("hace 2 minutos") que se actualiza sola cada 30 segundos.
 * Más allá de 7 días muestra la fecha corta.
 */
export function useRelativeTime(date: string | Date | null | undefined): string {
  const { language, t } = useLanguage();
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    if (!date) return "";
    const time = new Date(date).getTime();
    if (Number.isNaN(time)) return "";
    const now = tick * TICK_MS;
    const diffSeconds = Math.round((time - now) / 1000);
    const abs = Math.abs(diffSeconds);

    if (abs < 45) return t("messaging.time.now");

    const rtf = new Intl.RelativeTimeFormat(language === "en" ? "en" : "es", {
      numeric: "auto",
    });
    if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
    if (abs < 604800) return rtf.format(Math.round(diffSeconds / 86400), "day");

    return new Date(time).toLocaleDateString(
      language === "en" ? "en-US" : "es-SV",
      { day: "numeric", month: "short", year: "numeric" }
    );
  }, [date, tick, language, t]);
}
