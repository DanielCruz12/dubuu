"use client";
import { FilterX } from "lucide-react";
import { Card } from "./ui/card";
import Link from "next/link";
import { useAppSelector } from "@/redux/store";
import { RootState } from "@/redux/store";

export function NoSearchResults() {
  const { productType } = useAppSelector((state: RootState) => state.filters);

  // Diccionario de rutas y textos en español
  const productTypeRoutes: Record<string, { path: string; label: string }> = {
    tour: {
      path: "/tours",
      label: "Ver todos los tours disponibles",
    },
    rental: {
      path: "/alquileres",
      label: "Ver todos los alquileres disponibles",
    },
    // Puedes añadir más tipos si es necesario
  };

  const routeInfo = productTypeRoutes[productType] ?? {
    path: "/productos",
  };

  return (
    <section className="py-6">
      <div className="grid gap-8">
        <div className="p-4">
          <Card className="flex flex-col items-center justify-center h-full min-h-[385px] text-center rounded-3xl border-0 shadow p-8">
            <div className="mb-4 p-4 bg-muted rounded-full">
              <FilterX className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              No encontramos ningún resultado que coincida con tus filtros
              actuales. Intenta ajustar los criterios de búsqueda o revisa
              nuestra colección completa.
            </p>

            <Link
              href={routeInfo.path}
              className="text-primary hover:underline mt-2 text-sm font-medium"
            >
              {routeInfo.label}
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
