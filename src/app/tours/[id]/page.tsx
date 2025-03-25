"use client";

import { MapPin, Users, Clock, Calendar, Globe } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ImageCollage from "@/components/sections/image-collage";
import Head from "next/head";
import { notFound, useParams } from "next/navigation";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import ImageCollageSkeleton from "@/components/skeletons/image-collage-skeleton";
import ReviewSection from "@/components/sections/reviews/reviews-section";
import BookingForm from "@/components/sections/booking-form";
import { useEffect, useState } from "react";
import Rating from "@/components/rating";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

  const details = [
    {
      icon: <Calendar className="w-5 h-5 text-primary rounded-xl" />,
      title: "Duration",
      value: `${product.duration} days`,
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: "Group Size",
      value: `${product.max_people} people`,
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "Tour Type",
      value: product.product_category.name,
    },
    {
      icon: <Globe className="w-5 h-5 text-primary" />,
      title: "Language",
      value: "English",
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: "Price",
      value: product.price ? `$${product.price}` : "N/A",
    },
    {
      icon: <Globe className="w-5 h-5 text-primary" />,
      title: "Departure",
      value: "City A",
    },
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      title: "Arrival",
      value: "City B",
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "Guide",
      value: "John Doe",
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: "Rating",
      value: "4.5/5",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      <Head>{product.name}</Head>

      <section className="w-full mb-8">
        <div className="mb-6">
          <div className="flex  flex-col md:flex-row items-start gap-2  text-sm">
            <Rating
              averageRating={product.average_rating}
              reviewsCount={product.total_reviews}
              maxStars={5}
              activeStarClassName="text-yellow-400 fill-yellow-400"
              inactiveStarClassName="text-gray-300"
            />
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="text-muted-foreground">
                {product?.departure_point}
              </span>
            </div>
          </div>
          <h1 className="text-xl md:text-3xl font-semibold">{product?.name}</h1>
        </div>

        <ImageCollage banner={product.banner} images={product?.images} />

        <ScrollArea type="always" className="w-full pt-2">
          <div className="flex gap-1 md:gap-4 p-4">
            {details.map((detail, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg w-[130px] md:w-[200px] p-2"
              >
                {detail.icon}
                <div>
                  <div className="text-xs sm:text-sm md:text-base font-medium">
                    {detail.title}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    {detail.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      <section className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Left column - Scrollable content */}
        <div className="w-full lg:w-2/3">
          <div className="mb-8">
            <Accordion
              type="multiple"
              defaultValue={["overview", "highlight", "included"]}
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
            </Accordion>
          </div>

          <div className="hidden md:block">
            <ReviewSection productId={product.id} />
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
              <BookingForm product={product} />
            </div>
          </div>
        </div>
      </section>
      <div className="md:hidden block">
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}
