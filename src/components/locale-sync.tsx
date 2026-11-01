"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/lib/i18n-context";
import { getClerkSessionToken } from "@/redux/clerk-token";

/**
 * Guarda el idioma activo en el backend para que los mensajes del chat y las
 * notificaciones push se compongan en el idioma de cada usuario. Silencioso:
 * si falla, el servidor usa español por defecto.
 */
export default function LocaleSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { language } = useLanguage();
  const lastSentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    const key = `${user.id}:${language}`;
    if (lastSentRef.current === key) return;
    lastSentRef.current = key;
    void (async () => {
      try {
        const sessionToken = await getClerkSessionToken();
        const response = await fetch("/backend/api/v1/users/locale", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
          },
          body: JSON.stringify({ locale: language }),
        });
        if (!response.ok && process.env.NODE_ENV === "development") {
          console.warn(`[locale-sync] backend respondió ${response.status}`);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[locale-sync] no se pudo guardar el idioma:", err);
        }
      }
    })();
  }, [isLoaded, isSignedIn, user?.id, language]);

  return null;
}
