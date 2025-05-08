"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import ImageCollage from "@/components/sections/image-collage";
import { useParams } from "next/navigation";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import { useGetBookingsByUserIdQuery } from "@/redux/slices/booking/booking-slice";
import ReviewSection from "@/components/sections/reviews/reviews-section";
import BookingForm from "@/components/sections/booking-form";
import Rating from "@/components/rating";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import ProductsSkeleton from "@/components/skeletons/product-skeleton";
import { Badge } from "@/components/ui/badge";
import type { IProduct } from "@/types/product";
import ProductDetails from "@/components/sections/product-details";
import TrustSection from "@/components/sections/trust-section";
import CheckoutForm from "@/components/sections/checkout/checkout-form";
import LocationMap from "@/components/location";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookingStatus } from "@/components/booking-status";
import clsx from "clsx";
import { useGetReviewsQuery } from "@/redux/slices/product/review-slice";
import { isProductType } from "@/utils";
import UpTop from "@/components/up-top";
import { calculatePriceWithTaxes } from "@/lib/price";

export default function ProductBooking() {
  const { user } = useUser();
  const { id } = useParams();
  const { data, isLoading, isError } = useGetProductQuery(id as string);

  const [bookingData, setBookingData] = useState<{
    datetime: string;
    tickets: { adult: number };
    addons: string[];
    total: number;
    user_id: string;
    product_id: string;
  } | null>(null);

  const { data: userBookings, isLoading: isLoadingBooking } =
    useGetBookingsByUserIdQuery(user?.id ?? "", {
      skip: !user?.id,
    });

  // Fetch reviews using the product ID from the URL params instead of bookingData
  const { data: reviews = [], isLoading: isLoadingReviews } =
    useGetReviewsQuery(id as string, {
      skip: !id,
    });

  const paymentRef = useRef<HTMLDivElement | null>(null);
  const [showPaymentStep, setShowPaymentStep] = useState(false);

  useEffect(() => {
    if (showPaymentStep && paymentRef.current) {
      paymentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showPaymentStep]);

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

  if (isLoading || isLoadingBooking) return <ProductsSkeleton />;
  if (isError || !product)
    return <div className="h-screen">Producto no encontrado</div>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingBooking: any = userBookings?.find(
    (b) => b.product_id === product.id
  );
  const isTour = isProductType(product, "tours");

  return (
    <div className="mx-auto md:px-0">
      <UpTop />
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

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-sm md:text-[1rem]">
              ${calculatePriceWithTaxes(product.price)}
            </Badge>
          </div>
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
        {showPaymentStep ? (
          <div ref={paymentRef} className="w-full lg:w-2/3">
            <CheckoutForm
              setShowPaymentStep={setShowPaymentStep}
              bookingData={bookingData}
            />
          </div>
        ) : (
          <div className="w-full lg:w-2/3">
            <ProductDetails product={product} />
            <div className="hidden md:block">
              <LocationMap
                product={product}
                title="Ubicación"
                locationName="Galar Gdański - Tourist Cruises"
                address="Dokowa 1, Gdansk, 80-863"
                latitude={isTour ? product.tour.lat : 0}
                longitude={isTour ? product.tour.long : 0}
                zoom={15}
              />
            </div>
            <div className="hidden md:block">
              {/* Pass reviews data to ReviewSection */}
              <ReviewSection
                existingBooking={existingBooking}
                productId={product.id}
                reviews={reviews}
                isLoading={isLoadingReviews}
              />
            </div>
          </div>
        )}

        <div className="w-full lg:w-1/3">
          <div
            style={{
              position: "sticky",
              top: `${headerHeight + 4}px`,
            }}
          >
            <div
              className={clsx(
                "rounded-lg mb-10",
                existingBooking?.status === "completed"
                  ? "p-0 "
                  : "p-3 md:p-5 sm:p-6 border"
              )}
            >
              {user ? (
                <div>
                  <div className="hidden md:block">
                    {existingBooking &&
                    existingBooking.status === "completed" ? (
                      <BookingStatus
                        id={existingBooking.id}
                        status="completed"
                        productName={product.name}
                        created_at={existingBooking.created_at}
                        tickets={{
                          adult: Number(existingBooking.tickets),
                        }}
                        user={user}
                        productId={product.id}
                        paymentMethod={existingBooking.paymentMethod}
                        total={Number(existingBooking.total)}
                        onViewDetails={() => alert("Ver detalles")}
                        onRebook={() => {
                          setShowPaymentStep(false);
                        }}
                      />
                    ) : (
                      <BookingForm
                        setBookingData={setBookingData}
                        showPaymentStep={showPaymentStep}
                        setShowPaymentStep={() => setShowPaymentStep(true)}
                        product={product}
                      />
                    )}
                  </div>
                  <div className="block md:hidden">
                    <Accordion defaultValue={["overview"]} type="multiple">
                      <AccordionItem value="overview">
                        <AccordionTrigger>
                          <div className="flex flex-row items-center gap-2 p-2">
                            <Badge className="">
                              {product.product_type.name}
                            </Badge>
                            {product.name}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {existingBooking &&
                          existingBooking.status === "completed" ? (
                            <BookingStatus
                              id={existingBooking.id}
                              status="completed"
                              productName={product.name}
                              created_at={existingBooking.created_at}
                              tickets={{
                                adult: Number(existingBooking.tickets),
                              }}
                              user={user}
                              productId={product.id}
                              paymentMethod={existingBooking.paymentMethod}
                              total={Number(existingBooking.total)}
                              onViewDetails={() => alert("Ver detalles")}
                              onRebook={() => {
                                setShowPaymentStep(false);
                              }}
                            />
                          ) : (
                            <BookingForm
                              setBookingData={setBookingData}
                              showPaymentStep={showPaymentStep}
                              setShowPaymentStep={() =>
                                setShowPaymentStep(true)
                              }
                              product={product}
                            />
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
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
            <TrustSection />
          </div>
        </div>
      </section>

      <div className="block md:hidden">
        <LocationMap
          product={product}
          title="Ubicación"
          locationName="Galar Gdański - Tourist Cruises"
          address="Dokowa 1, Gdansk, 80-863"
          latitude={isTour ? product.tour.lat : 0}
          longitude={isTour ? product.tour.long : 0}
          zoom={15}
        />
      </div>
      {!showPaymentStep && (
        <div className="md:hidden block">
          {/* Pass reviews data to ReviewSection in mobile view */}
          <ReviewSection
            existingBooking={existingBooking}
            productId={product.id}
            reviews={reviews}
            isLoading={isLoadingReviews}
          />
        </div>
      )}
    </div>
  );
}
