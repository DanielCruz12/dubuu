import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invierte en Dubuu",
  description:
    "Sé socio o invierte en la plataforma Dubuu: objetivo, modelo de negocio y proyecciones.",
  alternates: { canonical: "/investment" },
};

export default function InvestmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
