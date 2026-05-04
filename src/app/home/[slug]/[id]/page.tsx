"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import ImageCollage from "@/components/sections/image-collage";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import { useGetBookingsByUserIdQuery } from "@/redux/slices/booking/booking-slice";
import ReviewSection from "@/components/sections/reviews/reviews-section";
import CompanyInfo from "@/components/sections/company-info";
import BookingForm from "@/components/sections/booking-form";
import RentalBookingForm from "@/components/sections/rental-booking-form";
import RentalVehicleSpecs from "@/components/sections/rental-vehicle-specs";
import Rating from "@/components/rating";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import ProductsSkeleton from "@/components/skeletons/product-skeleton";
import { Badge } from "@/components/ui/badge";
import type { IProduct } from "@/types/product";
import ProductDetails from "@/components/sections/product-details";
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
import {
  getProductDisplayPrice,
  isRentalProduct,
  isRentalProductComplete,
} from "@/utils/product-helpers";
import UpTop from "@/components/up-top";
import { ShareModal } from "@/components/share-modal";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { useLanguage } from "@/lib/i18n-context";

function withCacheKey(src: string, key?: string) {
  const trimmed = (src ?? "").trim();
  if (!trimmed) return trimmed;
  if (!key?.trim()) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  const v = encodeURIComponent(key);
  return trimmed.includes("?") ? `${trimmed}&v=${v}` : `${trimmed}?v=${v}`;
}

export default function ProductBooking() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useUser();
  const { id } = useParams();

  // Socket: join con userId y escuchar payment:completed (toast + redirect)
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    function onConnect() {
      socket.emit("join", { userId });
    }

    function onPaymentCompleted(_data: { bookingId: string; status: string }) {
      console.log(_data);
      toast.success(t("home.checkout.toast.paymentConfirmed"));
      router.push("/account/bookings");
    }

    if (socket.connected) onConnect();

    socket.on("connect", onConnect);
    socket.on("payment:completed", onPaymentCompleted);

    return () => {
      socket.off("connect", onConnect);
      socket.off("payment:completed", onPaymentCompleted);
    };
  }, [user?.id, router, t]);

  const { data, isLoading, isError } = useGetProductQuery(id as string);
  const convert = formatUsd;
  const symbol = USD_SYMBOL;

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
      refetchOnMountOrArgChange: true,
    });

  // Fetch reviews using the product ID from the URL params instead of bookingData
  const { data: reviews = [], isLoading: isLoadingReviews } =
    useGetReviewsQuery(id as string, {
      skip: !id,
    });

  const paymentRef = useRef<HTMLDivElement | null>(null);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [showBookingFormAgain, setShowBookingFormAgain] = useState(false);
  const [bookingFormKey, setBookingFormKey] = useState(0);
  const bookingBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showPaymentStep && paymentRef.current) {
      paymentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showPaymentStep]);

  useEffect(() => {
    if (showBookingFormAgain && bookingBoxRef.current) {
      bookingBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showBookingFormAgain]);

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
    return (
      <div className="h-screen">{t("home.landing.productDetail.notFound")}</div>
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productBookings: any[] = (userBookings ?? []).filter(
    (b) => b.product_id === product.id,
  );
  const hasAnyProductBooking = productBookings.length > 0;
  const hasMultipleProductBookings = productBookings.length > 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingBooking: any =
    productBookings.length > 0
      ? productBookings.reduce((latest, current) => {
          const latestDate = new Date(latest?.created_at ?? 0).getTime();
          const currentDate = new Date(current?.created_at ?? 0).getTime();
          return currentDate > latestDate ? current : latest;
        })
      : undefined;
  const isTour = isProductType(product, "tours");
  const isRental = isRentalProduct(product);
  const hasRentalDetail = isRentalProductComplete(product);
  const displayPrice = getProductDisplayPrice(product);

  // Show the latest booking status card (completed or in-process) unless user is rebooking
  const showBookingStatusCard = !!existingBooking && !showBookingFormAgain;

  const mobileBookingBottomPad =
    !!user &&
    !showPaymentStep &&
    !showBookingStatusCard;

  return (
    <div
      className={clsx(
        "mx-auto md:px-0",
        mobileBookingBottomPad && "max-md:pb-28",
      )}
    >
      <UpTop />
      <section className="w-full mb-8">
        <div className="mb-4">
          <div className="flex flex-col md:flex-row items-start gap-2 text-sm">
            <Rating
              averageRating={Number(product.average_rating)}
              reviewsCount={product.total_reviews}
              maxStars={5}
              activeStarClassName="text-yellow-400 fill-yellow-400"
              inactiveStarClassName="text-gray-300"
            />
          </div>
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-xl md:text-3xl font-semibold flex-1 pr-4 line-clamp-2">
              {product?.name}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ShareModal
                title={product?.name}
                url={typeof window !== "undefined" ? window.location.href : ""}
                description={product?.description?.substring(0, 100) + "..."}
                image={withCacheKey(product?.banner ?? "", product?.updated_at)}
              />
              {/*   <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-gray-100 p-2"
              >
                <Heart className="h-4 w-4 " />
                <span className="text-sm font-medium underline">Guardar</span>
              </Button> */}
            </div>
          </div>
          <div className="flex items-center gap-2 md:mt-2">
            <Badge
              variant="secondary"
              className="md:p-2 text-xl md:text-[2rem]"
            >
              {symbol}
              {convert(displayPrice)}
            </Badge>
            <span className="text-sm font-normal">
              {isRental ? t("home.bookingForm.perDay") : t("home.bookingForm.perPerson")}
            </span>
          </div>
        </div>

        <ImageCollage
          banner={product.banner}
          images={product?.images}
          cacheKey={product.updated_at}
        />
        {!isRental ? (
          <div className="pt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="w-6 h-6 md:w-5 md:h-5 shrink-0 text-primary" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm md:text-base leading-snug">
                  {product?.address || "—"}
                </p>
                {product?.country ? (
                  <p className="text-xs md:text-sm text-muted-foreground">{product.country}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        <ScrollArea type="always" className="w-full">
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

      <section className="flex flex-col lg:flex-row gap-4 md:gap-8 mb-5 md:mb-12">
        {showPaymentStep ? (
          <div ref={paymentRef} className="w-full lg:w-2/3">
            <CheckoutForm
              setShowPaymentStep={setShowPaymentStep}
              bookingData={bookingData}
            />
          </div>
        ) : (
          <div
            className={clsx(
              "w-full lg:w-2/3 min-w-0",
              hasRentalDetail && "flex flex-col gap-6",
            )}
          >
            {hasRentalDetail ? <RentalVehicleSpecs product={product} /> : null}
            <ProductDetails product={product} />
            {!isRental ? (
              <div className="hidden md:block w-full min-w-0">
                <LocationMap
                  title={t("home.landing.productDetail.departurePoint")}
                  product={product}
                  latitude={isTour ? product.tour.lat : 0}
                  longitude={isTour ? product.tour.long : 0}
                  zoom={15}
                />
              </div>
            ) : null}
            <div className="hidden md:block">
              {/* Pass reviews data to ReviewSection */}
              <ReviewSection
                existingBooking={existingBooking}
                productId={product.id}
                reviews={reviews}
                isLoading={isLoadingReviews}
              />
              <CompanyInfo product={product} />
            </div>
          </div>
        )}

        <div className="w-full lg:w-1/3 min-w-0">
          <div
            style={{
              position: "sticky",
              top: `${headerHeight + 4}px`,
            }}
          >
            <div
              ref={bookingBoxRef}
              className={clsx(
                "rounded-lg mb-0 md:mb-6",
                showBookingStatusCard ? "p-0 " : "border px-3 py-2 sm:px-4 sm:py-2.5 md:px-4 md:py-3",
              )}
            >
              {user ? (
                <div>
                  <div className="hidden md:block">
                    {showBookingStatusCard ? (
                      <BookingStatus
                        id={existingBooking.id}
                        status={existingBooking.status}
                        productName={product.name}
                        created_at={existingBooking.created_at}
                        tourDate={existingBooking.tourDate}
                        tickets={{
                          adult: Number(existingBooking.tickets),
                        }}
                        user={user}
                        productId={product.id}
                        paymentMethod={existingBooking.paymentMethod}
                        total={Number(existingBooking.total)}
                        onViewDetails={() =>
                          alert(t("home.landing.productDetail.viewDetails"))
                        }
                        extraFooterAction={
                          hasMultipleProductBookings ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="w-full"
                              onClick={() => router.push("/account/bookings")}
                            >
                              <Ticket className="h-4 w-4 mr-2" />
                              {t("home.bookingStatus.viewMyTickets")}
                            </Button>
                          ) : null
                        }
                        onRebook={() => {
                          setShowPaymentStep(false);
                          setBookingData(null);
                          setShowBookingFormAgain(true);
                          setBookingFormKey((k) => k + 1);
                        }}
                      />
                    ) : (
                      <div className="space-y-2">
                        {hasRentalDetail ? (
                          <RentalBookingForm
                            product={product}
                            extraActionBelowBookNow={
                              hasAnyProductBooking && showBookingFormAgain ? (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="w-full"
                                  onClick={() => {
                                    if (hasMultipleProductBookings) {
                                      router.push("/account/bookings");
                                      return;
                                    }
                                    setShowBookingFormAgain(false);
                                  }}
                                >
                                  <Ticket className="h-4 w-4 mr-2" />
                                  {t("home.bookingStatus.viewMyTickets")}
                                </Button>
                              ) : null
                            }
                          />
                        ) : isRental ? (
                          <p className="text-sm text-muted-foreground">
                            {t("home.rentalBooking.incompleteListing")}
                          </p>
                        ) : (
                          <BookingForm
                            key={`booking-form-${bookingFormKey}`}
                            setBookingData={setBookingData}
                            showPaymentStep={showPaymentStep}
                            setShowPaymentStep={() => setShowPaymentStep(true)}
                            product={product}
                            extraActionBelowBookNow={
                              hasAnyProductBooking && showBookingFormAgain ? (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="w-full"
                                  onClick={() => {
                                    if (hasMultipleProductBookings) {
                                      router.push("/account/bookings");
                                      return;
                                    }
                                    setShowBookingFormAgain(false);
                                  }}
                                >
                                  <Ticket className="h-4 w-4 mr-2" />
                                  {t("home.bookingStatus.viewMyTickets")}
                                </Button>
                              ) : null
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="block md:hidden">
                    <Accordion
                      value={showPaymentStep ? [] : ["overview"]}
                      type="multiple"
                    >
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
                          {showBookingStatusCard ? (
                            <BookingStatus
                              id={existingBooking.id}
                              status={existingBooking.status}
                              productName={product.name}
                              created_at={existingBooking.created_at}
                              tourDate={existingBooking.tourDate}
                              tickets={{
                                adult: Number(existingBooking.tickets),
                              }}
                              user={user}
                              productId={product.id}
                              paymentMethod={existingBooking.paymentMethod}
                              total={Number(existingBooking.total)}
                              onViewDetails={() =>
                                alert(
                                  t("home.landing.productDetail.viewDetails"),
                                )
                              }
                              extraFooterAction={
                                hasMultipleProductBookings ? (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => router.push("/account/bookings")}
                                  >
                                    <Ticket className="h-4 w-4 mr-2" />
                                    {t("home.bookingStatus.viewMyTickets")}
                                  </Button>
                                ) : null
                              }
                              onRebook={() => {
                                setShowPaymentStep(false);
                                setBookingData(null);
                                setShowBookingFormAgain(true);
                                setBookingFormKey((k) => k + 1);
                              }}
                            />
                          ) : (
                            <div className="space-y-2">
                              {hasRentalDetail ? (
                                <RentalBookingForm
                                  product={product}
                                  extraActionBelowBookNow={
                                    hasAnyProductBooking && showBookingFormAgain ? (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => {
                                          if (hasMultipleProductBookings) {
                                            router.push("/account/bookings");
                                            return;
                                          }
                                          setShowBookingFormAgain(false);
                                        }}
                                      >
                                        <Ticket className="h-4 w-4 mr-2" />
                                        {t("home.bookingStatus.viewMyTickets")}
                                      </Button>
                                    ) : null
                                  }
                                />
                              ) : isRental ? (
                                <p className="text-sm text-muted-foreground">
                                  {t("home.rentalBooking.incompleteListing")}
                                </p>
                              ) : (
                                <BookingForm
                                  key={`booking-form-${bookingFormKey}`}
                                  setBookingData={setBookingData}
                                  showPaymentStep={showPaymentStep}
                                  setShowPaymentStep={() =>
                                    setShowPaymentStep(true)
                                  }
                                  product={product}
                                  extraActionBelowBookNow={
                                    hasAnyProductBooking && showBookingFormAgain ? (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => {
                                          if (hasMultipleProductBookings) {
                                            router.push("/account/bookings");
                                            return;
                                          }
                                          setShowBookingFormAgain(false);
                                        }}
                                      >
                                        <Ticket className="h-4 w-4 mr-2" />
                                        {t("home.bookingStatus.viewMyTickets")}
                                      </Button>
                                    ) : null
                                  }
                                />
                              )}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("home.landing.productDetail.loginRequiredTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("home.landing.productDetail.loginRequiredDescription")}
                    <br />
                  </p>
                  <SignInButton>
                    <Button>{t("common.login")}</Button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {!isRental ? (
        <div className="block md:hidden w-full min-w-0 px-1 sm:px-0">
          <LocationMap
            product={product}
            title={t("home.landing.productDetail.departurePoint")}
            latitude={isTour ? product.tour.lat : 0}
            longitude={isTour ? product.tour.long : 0}
            zoom={15}
          />
        </div>
      ) : null}
      {!showPaymentStep && (
        <div className="md:hidden block">
          <CompanyInfo product={product} />
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
