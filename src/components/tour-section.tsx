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
import { TourCard } from "@/components/tour-card";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import { TourCardSkeleton } from "./skeletons/tour-card-skeleton";

export default function TourSection() {
  const plugin = useRef(Autoplay({ delay: 2200, stopOnInteraction: true }));
  const { data: products = [], isLoading } = useGetProductsQuery();

  return (
    <section className="py-6">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/3 p-4"
                >
                  <TourCardSkeleton />
                </CarouselItem>
              ))
            : products.map((tour) => (
                <CarouselItem
                  key={tour.id}
                  className="md:basis-1/2 lg:basis-1/3 p-4"
                >
                  <TourCard {...tour} />
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
