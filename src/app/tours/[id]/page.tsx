"use client";

import { MapPin, Users, Clock, Calendar, Globe } from "lucide-react";
import { Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ImageCollage from "@/components/image-collage";
import Head from "next/head";
import { notFound, useParams } from "next/navigation";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import ImageCollageSkeleton from "@/components/skeletons/image-collage-skeleton";
import ReviewSection from "@/components/sections/reviews-section";
import BookingForm from "@/components/sections/booking-form";
import { useEffect, useState } from "react";

export default function ProductBooking() {
  const { id } = useParams();
  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductQuery(id as string);

  const [headerHeight, setHeaderHeight] = useState(0);

  // Measure header height to adjust sticky positioning
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }

    // Re-measure on resize
    const handleResize = () => {
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) return <ImageCollageSkeleton />;
  if (isError || !product) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      {/* SEO */}
      <Head>{product.name}</Head>

      {/* Top section - Full width */}
      <section className="w-full mb-8">
        {/* Title and ratings */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 text-sm">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{product.average_rating}</span>
            <span className="text-muted-foreground">
              {product.total_reviews === 0
                ? "(No reviews)"
                : product?.total_reviews === 1
                  ? `(1 review)`
                  : `(${product?.total_reviews} reviews)`}
            </span>
            <span className="mx-2">•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="text-muted-foreground">
                {product?.departure_point}
              </span>
            </div>
          </div>
          <h1 className="text-xl md:text-3xl font-semibold">{product?.name}</h1>
        </div>

        {/* Image gallery */}
        <ImageCollage banner={product.banner} images={product?.images} />

        {/* Quick info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 mt-6 rounded-lg shadow dark:shadow-gray-800/10">
          <div className="flex items-center gap-2 rounded-lg">
            <Calendar className="w-5 h-5 text-primary rounded-xl" />
            <div>
              <div className="text-xs sm:text-sm md:text-base font-medium">
                Duration
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                {product.duration} days
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs sm:text-sm md:text-base font-medium">
                Group Size
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                {product.max_people} people
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs sm:text-sm md:text-base font-medium">
                Tour Type
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                {product.product_category.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs sm:text-sm md:text-base font-medium">
                Language
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                English
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Middle section - Two columns on desktop */}
      <section className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Left column - Scrollable content */}
        <div className="w-full lg:w-2/3">
          {/* Tour description */}
          <div className="mb-8">
            <Accordion
              type="multiple"
              defaultValue={["overview"]}
              className="space-y-4"
            >
              <AccordionItem value="overview">
                <AccordionTrigger className="text-base md:text-xl font-semibold">
                  Overview
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 font-normal text-xs sm:text-sm md:text-base text-muted-foreground">
                    <p>{product?.description}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="highlight">
                <AccordionTrigger className="text-base md:text-xl font-semibold">
                  Highlight
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 font-normal text-xs sm:text-sm md:text-base text-muted-foreground">
                    <p>{product?.description}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="itinerary">
                <AccordionTrigger className="text-base md:text-xl font-semibold">
                  Itinerary
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 font-normal text-xs sm:text-sm md:text-base text-muted-foreground">
                    <p>Day by day itinerary details will be displayed here.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="included">
                <AccordionTrigger className="text-base md:text-xl font-semibold">
                  What&apos;s Included
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 font-normal text-xs sm:text-sm md:text-base text-muted-foreground">
                    <p>
                      Details about what&apos;s included in the tour package.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="hidden md:block">
            <ReviewSection product={product} />
          </div>
        </div>

        {/* Right column - Sticky booking form */}
        <div className="w-full lg:w-1/3">
          <div
            style={{
              position: "sticky",
              top: `${headerHeight + 4}px`,
            }}
          >
            <div className="bg-background dark:bg-background rounded-lg border dark:border-muted shadow-md mb-10">
              <BookingForm productName={product.name} />
            </div>
          </div>
        </div>
      </section>
      <div className="md:hidden block">
        <ReviewSection product={product} />
      </div>
    </div>
  );
}
