import type { Metadata } from "next";

// Página placeholder (aún sin contenido real ni enlaces desde la navegación):
// se marca como noindex hasta que esté terminada.
export const metadata: Metadata = {
  alternates: { canonical: "/rental" },
  robots: { index: false, follow: false },
};

export default function RentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
