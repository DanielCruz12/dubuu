"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { LocalizationResource } from "@clerk/types";
import { esES, enUS } from "@clerk/localizations";
import { useLanguage } from "@/lib/i18n-context";

const clerkLocalizationES: LocalizationResource = {
  ...esES,
  signIn: {
    ...esES.signIn,
    start: {
      ...esES.signIn?.start,
      title: "Bienvenido a Dubuu",
      subtitle: "Ingresa para gestionar tus viajes",
      actionText: "¿No tienes cuenta?",
      actionLink: "Regístrate",
    },
  },
  socialButtonsBlockButton: "Continuar con {{provider|titleize}}",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(262, 4%, 45%)",
  },
  layout: {
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "blockButton" as const,
    logoPlacement: "inside" as const,
  },
};

export function ClerkLocalizedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  const localization: LocalizationResource =
    language === "es" ? clerkLocalizationES : enUS;

  return (
    <ClerkProvider
      localization={localization as Parameters<typeof ClerkProvider>[0]["localization"]}
      appearance={clerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
}
