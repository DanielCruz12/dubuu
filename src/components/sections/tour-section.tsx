"use client";

import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TourCard } from "@/components/tour-card";
import { TourCardSkeleton } from "../skeletons/tour-card-skeleton";
import type { IProduct } from "@/types/product";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NoSearchResults } from "../not-results-found";

export default function TourSection({
  products,
  isLoading,
}: {
  products: IProduct[];
  isLoading: boolean;
}) {
  const plugin = useRef(Autoplay({ delay: 2200, stopOnInteraction: true }));
  const showSeeAllButton = products.length > 10;
  const showCarousel = products.length > 4;

  if (isLoading) {
    return <TourCardSkeleton />;
  }

  if (products.length === 0) {
    return <NoSearchResults />;
  }

  return (
    <section className="py-6">
      {showCarousel ? (
        // Show carousel when there are more than 3 products
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {products.map((tour) => (
              <CarouselItem
                key={tour.id}
                className="md:basis-1/2 lg:basis-1/4 p-4"
              >
                <TourCard {...tour} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      ) : (
        // Show grid layout when there are 3 or fewer products
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {products.map((tour) => (
            <div key={tour.id}>
              <TourCard {...tour} />
            </div>
          ))}
        </div>
      )}

      {showSeeAllButton && (
        <div className="flex justify-center mt-8">
          <Link href="/tours/all">
            <Button variant="outline" className="group">
              Ver todos los viajes
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
