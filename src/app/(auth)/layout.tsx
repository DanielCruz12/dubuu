import type { Metadata } from "next";

// Sign-in/sign-up: no aportan valor en resultados de búsqueda y no deben
// competir con la home como canonical.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
