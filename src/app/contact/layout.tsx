import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Ponte en contacto con el equipo de Dubuu para consultas, soporte o alianzas comerciales.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
