"use client";
import { FilterX } from "lucide-react";
import { Card } from "./ui/card";
// import Link from "next/link";
// import { useAppSelector } from "@/redux/store";
// import type { RootState } from "@/redux/store";
// import { productTypes } from "@/utils/data";

export function NoSearchResults() {
  //const { productType } = useAppSelector((state: RootState) => state.filters);

  // Obtener la información del tipo de producto actual
  // const currentProductTypeInfo = productTypes.find(
  //   (type) => type.name === productType
  // );

  // Obtener la descripción y el ID del tipo de producto
  // const displayName = currentProductTypeInfo?.description || productType;
  // const productId = currentProductTypeInfo?.id;

  // Determinar el artículo correcto basado en el ID del producto
  // Si el ID es 2 (propiedades), usar "las" en lugar de "los"
  //const article = productId === 2 ? "todas las" : "todos los";

  // Construir la información de la ruta usando el artículo correcto
  /*  const routeInfo = {
    label: `Ver ${article} ${displayName} disponibles`,
  }; */

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
              actuales. Intenta ajustar los criterios de búsqueda.
            </p>

            {/*    <Link
              href={routeInfo.path}
              className="text-primary hover:underline mt-2 text-sm font-medium"
            >
              {routeInfo.label.toLowerCase()}
            </Link> */}
          </Card>
        </div>
      </div>
    </section>
  );
}
