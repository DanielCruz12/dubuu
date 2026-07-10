import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explora tours, experiencias y alquileres",
  description:
    "Descubre y reserva tours, experiencias y alquiler de vehículos en El Salvador y Centroamérica.",
  alternates: { canonical: "/home" },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-5 md:px-20 pb-10">{children}</div>;
}
