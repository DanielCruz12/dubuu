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
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight, FilterX } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { resetFilters } from "@/redux/slices/filter/filter-slice";

export default function TourSection({
  products,
  isLoading,
}: {
  products: IProduct[];
  isLoading: boolean;
}) {
  const dispatch = useAppDispatch();
  const plugin = useRef(Autoplay({ delay: 2200, stopOnInteraction: true }));
  const showSeeAllButton = products.length > 10;

  if (isLoading) {
    return (
      <section className="py-6">
        <Carousel className="w-full">
          <CarouselContent>
            {Array.from({ length: 3 }).map((_, index) => (
              <CarouselItem
                key={index}
                className="md:basis-1/2 lg:basis-1/3 p-4"
              >
                <TourCardSkeleton />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-6">
        <div className="grid gap-8">
          <div className="p-4">
            <Card className="flex flex-col items-center justify-center h-full min-h-[385px] text-center rounded-3xl border-0 shadow p-8">
              <div className="mb-4 p-4 bg-muted rounded-full">
                <FilterX className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tours found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                We couldn&apos;t find any tours matching your current filters.
                Try adjusting your search criteria or browse our complete
                collection.
              </p>
              <Button
                onClick={() => dispatch(resetFilters())}
                variant="outline"
                className="mb-2"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Reset all filters
              </Button>

              <Link href="/tours" className="text-primary hover:underline mt-2">
                View all available tours
              </Link>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
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
              <TourCard {...tour} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      {showSeeAllButton && (
        <div className="flex justify-center mt-8">
          <Link href="/tours/all">
            <Button variant="outline" className="group">
              See all tours
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
