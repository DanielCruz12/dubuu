import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton alineado con ExperienceCard: foto grande (aspect-[4/5]), badge
 * arriba a la izquierda, corazón arriba a la derecha, título/precio/botón
 * superpuestos abajo. Usa la misma grid que el contenido real para que no
 * haya salto de layout al terminar de cargar.
 */
export function TourCardSkeleton() {
  return (
    <section className="py-4 sm:py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl"
          >
            <Skeleton className="absolute inset-0 h-full w-full rounded-3xl" />

            <div className="absolute left-4 top-4">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="absolute right-4 top-4">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            <div className="absolute inset-x-0 bottom-0 space-y-3 p-5">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-5 w-3/4 rounded" />
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
