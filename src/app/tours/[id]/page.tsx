"use client";

import { MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ImageCollage from "@/components/sections/image-collage";
import Head from "next/head";
import { useParams } from "next/navigation";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import ReviewSection from "@/components/sections/reviews/reviews-section";
import BookingForm from "@/components/sections/booking-form";
import { useEffect, useState } from "react";
import Rating from "@/components/rating";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import ProductsSkeleton from "@/components/skeletons/product-skeleton";
import { Badge } from "@/components/ui/badge";
import { isProductType } from "@/utils";
import { IProduct } from "@/types/product";

export default function ProductBooking() {
  const { user } = useUser();
  const { id } = useParams();
  const { data, isLoading, isError } = useGetProductQuery(id as string);

  const product = data as IProduct;

  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }
    const handleResize = () => {
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) return <ProductsSkeleton />;
  if (isError || !product) return <>Producto no encontrado</>;

  const isTour = isProductType(product, "tour");
  const tourData = isTour ? product.tour : null;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Head>{product.name}</Head>

      <section className="w-full mb-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-start gap-2 text-sm">
            <Rating
              averageRating={Number(product.average_rating)}
              reviewsCount={product.total_reviews}
              maxStars={5}
              activeStarClassName="text-yellow-400 fill-yellow-400"
              inactiveStarClassName="text-gray-300"
            />
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="text-muted-foreground">{product?.address}</span>
            </div>
          </div>
          <h1 className="text-xl md:text-3xl font-semibold">{product?.name}</h1>
        </div>

        <ImageCollage banner={product.banner} images={product?.images} />

        <ScrollArea type="always" className="w-full pt-2">
          <div className="flex flex-wrap gap-2 md:gap-4 mt-3">
            {product.amenities?.map((service, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-sm md:text-[1rem] rounded-lg p-2 mt-2"
              >
                {service.name}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      <section className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="w-full lg:w-2/3">
          <div className="mb-8">
            <Accordion
              type="multiple"
              defaultValue={["overview", "highlight", "included"]}
              className="space-y-4"
            >
              <AccordionItem value="overview">
                <AccordionTrigger className="text-base md:text-xl font-semibold">
                  Descripción general
                </AccordionTrigger>
                <AccordionContent>
                  {tourData && (
                    <>
                      <span className="font-bold text">Punto de salida:</span>
                      <p>{tourData.departure_point}</p>
                    </>
                  )}
                  <div className="space-y-4 font-normal md:text-base text-muted-foreground">
                    <p>{product?.description}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="highlight">
                <AccordionTrigger className="text-base md:text-xl font-semibold">
                  Destacar
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 font-normal md:text-base text-muted-foreground">
                    <p>{tourData?.highlight}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="included">
                <AccordionTrigger className="text-base md:text-xl font-semibold">
                  Qué incluye
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 font-normal md:text-base text-muted-foreground">
                    <p>{tourData?.included}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="itinerary">
                <AccordionTrigger className="text-base md:text-xl font-semibold">
                  Itinerario
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="relative border-s border-gray-200 dark:border-gray-700">
                    {tourData?.itinerary?.map((item, index) => (
                      <li key={index} className="mb-3 ms-4">
                        <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                        <p className="space-y-4 font-normal md:text-base text-muted-foreground">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="hidden md:block">
            <ReviewSection productId={product.id} />
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div
            style={{
              position: "sticky",
              top: `${headerHeight + 4}px`,
            }}
          >
            <div className="bg-background dark:bg-background rounded-lg border dark:border-muted shadow-md mb-10 p-6">
              {user ? (
                <BookingForm product={product} />
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">
                    Necesitas iniciar sesión para realizar la reserva
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Inicia sesión o crea una cuenta para poder reservar y
                    disfrutar de nuestras promociones exclusivas.
                    <br />
                  </p>
                  <SignInButton>
                    <Button>Iniciar sesión</Button>
                  </SignInButton>
                </div>
              )}
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
