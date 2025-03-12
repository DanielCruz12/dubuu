"use client";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { NoSearchResults } from "@/components/not-results-found";
import { useGetProductsQuery } from "@/redux/slices/product-slice";

export default function TourSection() {
  const { data: products } = useGetProductsQuery("products");

  const plugin = useRef(Autoplay({ delay: 2200, stopOnInteraction: true }));

  const validProducts = products ?? [];
  console.log(validProducts);
  return (
    <section>
      {validProducts.length > 0 ? (
        <div>
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {/*   {filteredTours.map((tour, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/3 pl-4 p-4"
                >
                  <div className="p-1">
                    <TourCard {...tour} />
                  </div>
                </CarouselItem>
              ))} */}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      ) : (
        <NoSearchResults />
      )}
    </section>
  );
}
