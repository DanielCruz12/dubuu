/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { NoSearchResults } from "@/components/not-results-found";
import { TourCard } from "@/components/tour-card";
import { useGetProductsQuery } from "@/redux/slices/product-slice";

export default function TourSection() {
  const { data: products = [], isLoading, isError } = useGetProductsQuery();
  const plugin = useRef(Autoplay({ delay: 2200, stopOnInteraction: true }));

  if (isLoading) return <p className="text-center">Loading tours...</p>;
  if (isError || !products.length) return <NoSearchResults />;

  return (
    <section className="py-6">
      {products.length > 0 ? (
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
                className="md:basis-1/2 lg:basis-1/3 p-4"
              >
                <div className="p-1">
                  <TourCard {...tour} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      ) : (
        <NoSearchResults />
      )}
    </section>
  );
}
