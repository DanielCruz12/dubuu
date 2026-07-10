"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n-context";
import {
  OPEN_COOKIE_PREFERENCES_EVENT,
  getStoredConsent,
  saveConsent,
} from "@/lib/cookie-consent";

const TEXT = {
  es: {
    description:
      "Usamos cookies necesarias para el funcionamiento de la Plataforma y, si lo aceptas, cookies funcionales y analíticas para mejorar tu experiencia. Puedes cambiar tu decisión en cualquier momento.",
    privacyLink: "Ver Política de Privacidad",
    necessaryTitle: "Necesarias",
    necessaryDesc:
      "Indispensables para el inicio de sesión y la seguridad (Clerk, reCAPTCHA). No se pueden desactivar.",
    functionalTitle: "Funcionales",
    functionalDesc: "Recuerdan preferencias como el idioma seleccionado.",
    analyticsTitle: "Analíticas",
    analyticsDesc:
      "Google Analytics — nos ayuda a entender el uso agregado de la Plataforma.",
    configure: "Configurar",
    reject: "Rechazar",
    acceptAll: "Aceptar todas",
    save: "Guardar preferencias",
  },
  en: {
    description:
      "We use necessary cookies to run the Platform and, if you accept, functional and analytics cookies to improve your experience. You can change your choice at any time.",
    privacyLink: "View Privacy Policy",
    necessaryTitle: "Necessary",
    necessaryDesc:
      "Required for sign-in and security (Clerk, reCAPTCHA). These cannot be turned off.",
    functionalTitle: "Functional",
    functionalDesc: "Remember preferences such as your selected language.",
    analyticsTitle: "Analytics",
    analyticsDesc:
      "Google Analytics — helps us understand aggregate Platform usage.",
    configure: "Customize",
    reject: "Reject",
    acceptAll: "Accept all",
    save: "Save preferences",
  },
} as const;

export default function CookieConsentBanner() {
  const { language } = useLanguage();
  const copy = language === "en" ? TEXT.en : TEXT.es;

  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      setVisible(true);
    } else {
      setFunctional(consent.functional);
      setAnalytics(consent.analytics);
    }

    const handleOpenPreferences = () => {
      const current = getStoredConsent();
      if (current) {
        setFunctional(current.functional);
        setAnalytics(current.analytics);
      }
      setConfiguring(true);
      setVisible(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    return () =>
      window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    saveConsent({ functional: true, analytics: true });
    setVisible(false);
    setConfiguring(false);
  };

  const rejectAll = () => {
    saveConsent({ functional: false, analytics: false });
    setFunctional(false);
    setAnalytics(false);
    setVisible(false);
    setConfiguring(false);
  };

  const savePreferences = () => {
    saveConsent({ functional, analytics });
    setVisible(false);
    setConfiguring(false);
  };

  return (
    <div
      role="dialog"
      aria-label={copy.description}
      className="fixed inset-x-4 bottom-4 z-[11000] mx-auto flex max-w-md flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:inset-x-auto md:bottom-8 md:left-1/2 md:w-[60%] md:max-w-3xl md:-translate-x-1/2"
    >
      <p className="text-sm text-zinc-100">
        {copy.description}{" "}
        <Link href="/privacy" className="font-medium text-white underline">
          {copy.privacyLink}
        </Link>
      </p>

      {configuring && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                {copy.necessaryTitle}
              </p>
              <p className="text-xs text-zinc-300">{copy.necessaryDesc}</p>
            </div>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                {copy.functionalTitle}
              </p>
              <p className="text-xs text-zinc-300">{copy.functionalDesc}</p>
            </div>
            <Switch checked={functional} onCheckedChange={setFunctional} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                {copy.analyticsTitle}
              </p>
              <p className="text-xs text-zinc-300">{copy.analyticsDesc}</p>
            </div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-[11px]"
          onClick={rejectAll}
        >
          {copy.reject}
        </Button>
        <div className="flex flex-wrap justify-end gap-2">
          {!configuring && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() => setConfiguring(true)}
            >
              {copy.configure}
            </Button>
          )}
          {configuring ? (
            <Button
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={savePreferences}
            >
              {copy.save}
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={acceptAll}
            >
              {copy.acceptAll}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
