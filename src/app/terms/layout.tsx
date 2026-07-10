import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Términos y Condiciones",
    template: "%s",
  },
  description:
    "Estos Términos y Condiciones rigen el uso de Dubuu, incluyendo servicios, registro, seguridad, procesamiento de pagos y más. | These Terms and Conditions govern the use of Dubuu, including services, registration, security, payment processing and more.",
  alternates: { canonical: "/terms" },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
