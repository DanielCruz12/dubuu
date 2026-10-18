"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n-context";
import { COOKIE_CONSENT_EVENT, getStoredConsent } from "@/lib/cookie-consent";
import {
  enablePushNotifications,
  getNotificationsConsent,
  getPushSupport,
  setNotificationsConsent,
} from "@/lib/push-notifications";

const TEXT = {
  es: {
    promptTitle: "Activa las notificaciones",
    promptBody: "Recibe un aviso cuando se confirme tu reserva.",
    promptNote: "Tu navegador te pedirá permiso a continuación.",
    enable: "Habilitar",
    later: "Ahora no",
    enabled: "Notificaciones activadas correctamente.",
    unsupportedTitle: "Notificaciones no disponibles",
    unsupportedIos:
      "En iPhone o iPad, toca Compartir → Añadir a pantalla de inicio, abre Dubuu desde el ícono y activa las notificaciones. Requiere iOS 16.4 o superior.",
    unsupportedInsecure:
      "Las notificaciones requieren una conexión segura (HTTPS). Abre Dubuu con HTTPS e inténtalo de nuevo.",
    unsupportedBrowser:
      "Tu navegador no admite notificaciones push. Prueba con Chrome, Edge, Firefox o Safari actualizado.",
    understood: "Entendido",
  },
  en: {
    promptTitle: "Turn on notifications",
    promptBody: "Get an alert when your booking is confirmed.",
    promptNote: "Your browser will ask for permission next.",
    enable: "Enable",
    later: "Not now",
    enabled: "Notifications enabled successfully.",
    unsupportedTitle: "Notifications unavailable",
    unsupportedIos:
      "On iPhone or iPad, tap Share → Add to Home Screen, open Dubuu from the icon, and enable notifications. Requires iOS 16.4 or later.",
    unsupportedInsecure:
      "Notifications require a secure connection (HTTPS). Open Dubuu over HTTPS and try again.",
    unsupportedBrowser:
      "Your browser does not support push notifications. Try Chrome, Edge, Firefox, or an updated Safari.",
    understood: "Got it",
  },
} as const;

type Mode =
  | { kind: "prompt" }
  | { kind: "unsupported"; reason: "ios" | "insecure" | "browser" };

/**
 * Modal de consentimiento de notificaciones push, abajo a la derecha (estilo
 * banner de cookies). Se muestra una sola vez, solo con sesión iniciada y tras
 * decidirse el consentimiento de cookies. "Habilitar" dispara el prompt nativo
 * del navegador desde el clic del usuario (gesto requerido por Firefox/Safari).
 */
export default function NotificationsConsentModal() {
  const { language } = useLanguage();
  const copy = language === "en" ? TEXT.en : TEXT.es;
  const { isLoaded, isSignedIn } = useUser();

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setVisible(false);
      return;
    }

    const evaluate = () => {
      // No mostrarse al mismo tiempo que el banner de cookies.
      if (!getStoredConsent()) {
        setVisible(false);
        return;
      }

      const support = getPushSupport();
      const stored = getNotificationsConsent();

      if (!support.supported) {
        if (stored === "unsupported") {
          setVisible(false);
          return;
        }
        setMode({ kind: "unsupported", reason: support.reason });
        setVisible(true);
        return;
      }

      // Si era "unsupported" pero ahora hay soporte (p.ej. PWA instalada en
      // iOS), se ignora el aviso anterior y se muestra el prompt.
      if (stored === "accepted" || stored === "declined") {
        setVisible(false);
        return;
      }

      // granted: el auto-enabler registra el token en silencio.
      // denied: no se puede volver a pedir desde la app.
      if (Notification.permission !== "default") {
        setVisible(false);
        return;
      }

      setMode({ kind: "prompt" });
      setVisible(true);
    };

    evaluate();
    window.addEventListener(COOKIE_CONSENT_EVENT, evaluate);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, evaluate);
  }, [isLoaded, isSignedIn]);

  const handleEnable = async () => {
    setBusy(true);
    const result = await enablePushNotifications();
    setBusy(false);

    if (result.status === "active") {
      setNotificationsConsent("accepted");
      setVisible(false);
      toast.success(copy.enabled);
      return;
    }

    if (result.status === "error") {
      toast.error(result.message);
      if (Notification.permission === "denied") {
        setNotificationsConsent("declined");
        setVisible(false);
      }
    }
  };

  const handleDecline = () => {
    setNotificationsConsent("declined");
    setVisible(false);
  };

  const handleUnderstood = () => {
    setNotificationsConsent("unsupported");
    setVisible(false);
  };

  if (!visible || !mode) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="dubuu-notifications-consent-title"
      className="fixed inset-x-3 bottom-3 z-[11500] mx-auto flex max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 text-zinc-100 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:inset-x-auto md:bottom-8 md:right-8 md:mx-0"
    >
      <div className="space-y-1">
        <h2
          id="dubuu-notifications-consent-title"
          className="text-sm font-semibold"
        >
          {mode.kind === "prompt" ? copy.promptTitle : copy.unsupportedTitle}
        </h2>
        {mode.kind === "prompt" ? (
          <>
            <p className="text-xs text-zinc-300">{copy.promptBody}</p>
            <p className="text-[11px] text-zinc-400">{copy.promptNote}</p>
          </>
        ) : (
          <p className="text-xs text-zinc-300">
            {mode.reason === "ios"
              ? copy.unsupportedIos
              : mode.reason === "insecure"
                ? copy.unsupportedInsecure
                : copy.unsupportedBrowser}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {mode.kind === "prompt" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={handleDecline}
              disabled={busy}
            >
              {copy.later}
            </Button>
            <Button
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={handleEnable}
              disabled={busy}
            >
              {copy.enable}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={handleUnderstood}
          >
            {copy.understood}
          </Button>
        )}
      </div>
    </div>
  );
}
