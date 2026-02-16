import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";

export function TourCardSkeleton() {
  return (
    <section className="py-4 px-2 sm:py-6 sm:px-0 w-full">
      <Carousel className="w-full">
        <CarouselContent className="!flex flex-wrap">
          {Array.from({ length: 4 }).map((_, index) => (
            <CarouselItem
              key={index}
              className={`!basis-1/2 md:!basis-1/3 lg:!basis-1/4 p-2 sm:p-4 !max-w-[50%] md:!max-w-[33.33%] lg:!max-w-[25%] ${index >= 2 ? "hidden md:!block" : ""}`}
            >
              <div className="relative h-full rounded-lg">
                <Card className="overflow-hidden rounded-xl border-0 shadow-lg h-full">
                  {/* Imagen - Cuadrada en móvil, 16/10 en desktop */}
                  <div className="relative aspect-square md:aspect-[16/10] rounded-t-lg overflow-hidden">
                    <Skeleton className="absolute inset-0 w-full h-full" />

                    {/* Badge de categoría */}
                    <div className="absolute top-2 left-2 z-10">
                      <Skeleton className="h-5 w-16 md:h-6 md:w-20 rounded-md" />
                    </div>

                    {/* Botón de favorito */}
                    <div className="absolute top-2 right-2 z-10">
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>

                    {/* Indicadores de imagen */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Contenido para móvil - mismo padding y estructura que TourCard (p-2, flex-col gap-0.5) */}
                  <div className="block md:hidden">
                    <div className="p-2 flex flex-col gap-0.5">
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-3 w-24 rounded flex-shrink-0" />
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-3 w-8 rounded" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-full max-w-[90%] rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>

                  {/* Contenido para desktop - mismo padding que TourCard (CardContent pt-1, h3 pt-2, desc mb-3, Footer py-3) */}
                  <div className="hidden md:block">
                    <CardContent className="pt-1">
                      {/* Título + Rating (mismo layout que TourCard: flex justify-between, título con pt-2) */}
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-full max-w-[70%] rounded pt-2" />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-4 rounded-full" />
                          ))}
                          <Skeleton className="h-4 w-8 rounded" />
                        </div>
                      </div>

                      {/* Descripción (mb-3 como en TourCard) */}
                      <div className="space-y-1.5 mb-3">
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-3/4 rounded" />
                      </div>

                      {/* Ubicación (gap-x-2 gap-y-1 como en TourCard) */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <div className="flex items-center">
                          <Skeleton className="h-3.5 w-3.5 rounded-full mr-1" />
                          <Skeleton className="h-4 w-24 rounded" />
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between py-3">
                      <Skeleton className="h-5 w-16 rounded" />
                      <Skeleton className="h-9 w-24 rounded-full" />
                    </CardFooter>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
