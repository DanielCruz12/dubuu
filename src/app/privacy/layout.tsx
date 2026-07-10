import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo recopilamos, utilizamos y protegemos tu información personal en Dubuu. Nuestra política de privacidad explica nuestras prácticas de datos y tus derechos.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
