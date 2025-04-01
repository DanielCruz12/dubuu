import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";

export function TourCardSkeleton() {
  return (
    <section className="py-6 w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {Array.from({ length: 3 }).map((_, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-4">
              <div className="relative aspect-[16/10] rounded-lg">
                <Card className="overflow-hidden rounded-xl border-0 shadow-lg">
                  <div className="relative aspect-[16/10] rounded-t-lg overflow-hidden">
                    <Skeleton className="absolute inset-0 w-full h-full" />

                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                        />
                      ))}
                    </div>

                    {/* Badge y favorite */}
                    <Skeleton className="absolute top-2 left-2 h-6 w-20 rounded-full z-10" />
                  </div>

                  <CardContent className="pt-3">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-4 rounded-full" />
                      ))}
                      <Skeleton className="h-4 w-8 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>

                    {/* Title & Description */}
                    <Skeleton className="h-6 w-full rounded mb-2" />
                    <Skeleton className="h-4 w-3/4 rounded mb-2" />

                    {/* Tags */}
                    <div className="flex flex-wrap justify-start gap-3 mt-2">
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    <Skeleton className="h-6 w-14 rounded" />
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
