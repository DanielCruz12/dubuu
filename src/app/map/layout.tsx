import type { Metadata } from "next";

// Página aún no enlazada desde la navegación principal: se marca como
// noindex hasta que sea una ruta pública terminada, para no indexar contenido
// incompleto ni duplicar el canonical de la raíz.
export const metadata: Metadata = {
  alternates: { canonical: "/map" },
  robots: { index: false, follow: false },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
