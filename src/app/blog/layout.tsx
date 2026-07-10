import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Historias, guías y noticias de viajes de Dubuu.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
