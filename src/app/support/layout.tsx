import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayuda y Soporte",
  description:
    "Encuentra respuestas a preguntas frecuentes y contacta a nuestro equipo de soporte.",
  alternates: { canonical: "/support" },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
