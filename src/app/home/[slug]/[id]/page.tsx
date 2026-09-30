"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Armchair,
  Car,
  Cog,
  Droplets,
  FileText,
  Heart,
  MapPin,
  Palette,
  Ticket,
} from "lucide-react";
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
import RentalImportantInfoModal, {
  SectionCard,
} from "@/components/sections/rental-important-info-modal";
import Rating from "@/components/rating";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import ProductsSkeleton from "@/components/skeletons/product-skeleton";
import { Badge } from "@/components/ui/badge";
import { AmenityChip } from "@/components/amenity-chip";
import type { IProduct, ITourProduct } from "@/types/product";
import type { BookingFormData } from "@/types/booking";
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
import {
  useSaveProductMutation,
  useUnsaveProductMutation,
  useGetUserFavoritesQuery,
} from "@/redux/slices/favorite/favorite-slice";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { useLanguage } from "@/lib/i18n-context";
import { vibrateSuccess } from "@/lib/vibration";

function withCacheKey(src: string, key?: string) {
  const trimmed = (src ?? "").trim();
  if (!trimmed) return trimmed;
  if (!key?.trim()) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  const v = encodeURIComponent(key);
  return trimmed.includes("?") ? `${trimmed}&v=${v}` : `${trimmed}?v=${v}`;
}

export default function ProductPage() {
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
      vibrateSuccess();
      toast.success(t("home.checkout.toast.paymentConfirmed"));
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

  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);

  const handleSetBookingData = (data: BookingFormData) => setBookingData(data);

  const { data: userBookings, isLoading: isLoadingBooking } =
    useGetBookingsByUserIdQuery(user?.id ?? "", {
      skip: !user?.id,
      refetchOnMountOrArgChange: true,
    });

  const { data: favorites } = useGetUserFavoritesQuery(
    { userId: user?.id || "" },
    { skip: !user?.id },
  );
  const [saveProduct, { isLoading: isSaving }] = useSaveProductMutation();
  const [unsaveProduct, { isLoading: isUnsaving }] = useUnsaveProductMutation();

  const isFavorited =
    favorites?.some(
      (fav: { productId: string }) => fav.productId === (id as string),
    ) || false;

  const toggleFavorite = async () => {
    if (!user?.id) {
      toast.error(t("home.tourCard.loginToSave"));
      return;
    }
    try {
      if (isFavorited) {
        await unsaveProduct({
          productId: id as string,
          userId: user.id,
        }).unwrap();
        toast.success(t("home.tourCard.removedFromSaved"));
      } else {
        await saveProduct({
          productId: id as string,
          userId: user.id,
        }).unwrap();
        toast.success(t("home.tourCard.savedSuccess"));
      }
    } catch {
      toast.error(t("home.tourCard.saveError"));
    }
  };

  // Fetch reviews using the product ID from the URL params instead of bookingData
  const { data: reviews = [], isLoading: isLoadingReviews } =
    useGetReviewsQuery(id as string, {
      skip: !id,
    });

  const paymentRef = useRef<HTMLDivElement | null>(null);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [showBookingFormAgain, setShowBookingFormAgain] = useState(false);
  const [bookingFormKey, setBookingFormKey] = useState(0);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState<string[]>([
    "overview",
  ]);
  const bookingBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showPaymentStep) {
      setMobileAccordionOpen([]);
      if (paymentRef.current) {
        paymentRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      setMobileAccordionOpen(["overview"]);
    }
  }, [showPaymentStep]);

  useEffect(() => {
    if (showBookingFormAgain && bookingBoxRef.current) {
      bookingBoxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showBookingFormAgain]);

  const product = data as IProduct;

  const vehicle =
    product && isRentalProduct(product)
      ? {
          brand: product.rental.brand,
          model: product.rental.model,
          year: product.rental.year,
          color: product.rental.color,
          plate: product.rental.plate,
          vin: product.rental.vin,
          fuel_type: product.rental.fuel_type,
          transmission: product.rental.transmission,
          engine: product.rental.engine,
        }
      : undefined;

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

  const isTour = product ? isProductType(product, "tours") : false;
  const isRental = product ? isRentalProduct(product) : false;
  const displayPrice = product ? getProductDisplayPrice(product) : 0;

  const shareData = useMemo(() => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    if (!product) {
      return { title: "", url, description: "", image: "" };
    }

    const shortDesc = (product.description ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 80);

    // Derive values once to avoid TS narrowing product to never
    const productName = product.name;
    const productBanner = product.banner;
    const productUpdatedAt = product.updated_at;
    const productDescription = product.description;
    const rental = isRentalProduct(product) ? product.rental : null;

    if (isRental && rental) {
      const header = [rental.brand, rental.model, rental.year]
        .filter(Boolean)
        .join(" ");
      const priceFmt =
        displayPrice > 0
          ? `Desde ${symbol}${convert(displayPrice)}/${t("home.bookingForm.perDay")}`
          : "";
      return {
        title: priceFmt ? `${header || productName} — ${priceFmt}` : (header || productName),
        url,
        description: [priceFmt, shortDesc].filter(Boolean).join(" — "),
        image: withCacheKey(productBanner ?? "", productUpdatedAt),
      };
    }

    if (isTour) {
      const priceFmt =
        displayPrice > 0
          ? `Desde ${symbol}${convert(displayPrice)}/${t("home.bookingForm.perPerson")}`
          : "";
      return {
        title: priceFmt ? `${productName} — ${priceFmt}` : productName,
        url,
        description: [priceFmt, shortDesc].filter(Boolean).join(" — "),
        image: withCacheKey(productBanner ?? "", productUpdatedAt),
      };
    }

    return {
      title: productName,
      url,
      description: (productDescription ?? "").substring(0, 100) + "...",
      image: withCacheKey(productBanner ?? "", productUpdatedAt),
    };
  }, [
    product,
    isRental,
    isTour,
    displayPrice,
    symbol,
    convert,
    t,
  ]);

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
  const hasRentalDetail = isRentalProductComplete(product);

  // Show the latest booking status card (completed or in-process) unless user is rebooking
  const showBookingStatusCard = !!existingBooking && !showBookingFormAgain;

  const mobileBookingBottomPad =
    !!user && !showPaymentStep && !showBookingStatusCard;

  return (
    <div
      className={clsx(
        "mx-auto md:px-0",
        mobileBookingBottomPad && "max-md:pb-28",
      )}
    >
      <UpTop />
      <section className="w-full mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <div className="flex flex-col md:flex-row items-start gap-2 text-sm">
            <Rating
              averageRating={Number(product.average_rating)}
              reviewsCount={product.total_reviews}
              maxStars={5}
              activeStarClassName="text-yellow-400 fill-yellow-400"
              inactiveStarClassName="text-gray-300"
            />
          </div>
          <div className="flex justify-between items-start mb-2 mt-1">
            <h1 className="text-2xl md:text-3xl font-normal tracking-tight flex-1 pr-4 line-clamp-2">
              {product?.name}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ShareModal
                title={shareData.title}
                url={shareData.url}
                description={shareData.description}
              />
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={toggleFavorite}
                disabled={isSaving || isUnsaving}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorited
                      ? "fill-rose-500 text-rose-500"
                      : "text-gray-700 dark:text-white stroke-[2.5px] hover:text-rose-400"
                  } ${isSaving || isUnsaving ? "opacity-50" : ""}`}
                />
              </Button>
            </div>
          </div>
          <div className="flex items-baseline gap-2 md:mt-3">
            <span className="font-display text-xl md:text-2xl font-normal tracking-tight">
              {symbol}
              {convert(displayPrice)}
            </span>
            <span className="text-sm text-muted-foreground">
              {isRental
                ? t("home.bookingForm.perDay")
                : t("home.bookingForm.perPerson")}
            </span>
          </div>
        </motion.div>

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
              </div>
            </div>
          </div>
        ) : null}
        <ScrollArea type="always" className="w-full">
          <div className="flex flex-wrap gap-2 md:gap-4 mt-3">
            {product.amenities?.map((service, index) => (
              <AmenityChip
                key={service.id ?? index}
                name={service.name}
                iconName={service.icon}
              />
            ))}
            {isRental && "rental" in product && product.rental
              ? (() => {
                  const r = product.rental;
                  const colorKey = `home.rentalSpecs.colors.${r.color}`;
                  const color = t(colorKey);
                  const displayColor = color === colorKey ? r.color : color;

                  return (
                    <>
                      <AmenityChip
                        name={`${r.seating_capacity} ${t("home.rental.cardSeats")}`}
                        Icon={Armchair}
                      />
                      <AmenityChip
                        name={t(
                          `home.rentalSpecs.transmissionKind.${r.transmission}`,
                        )}
                        Icon={Cog}
                      />
                      <AmenityChip
                        name={t(`home.rentalSpecs.fuel.${r.fuel_type}`)}
                        Icon={Droplets}
                      />
                      <AmenityChip name={displayColor} Icon={Palette} />
                      <AmenityChip name={r.engine} Icon={Car} />
                    </>
                  );
                })()
              : null}
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
              onPaymentSuccess={() => {
                setShowPaymentStep(false);
                setBookingData(null);
                setShowBookingFormAgain(false);
              }}
            />
          </div>
        ) : (
          <div className="w-full lg:w-2/3 min-w-0">
            <ProductDetails product={product} />
            {isRental ? (
              <div className="mt-6 hidden md:block">
                <Accordion type="single" collapsible defaultValue="rental-agreement">
                  <AccordionItem
                    value="rental-agreement"
                    className="rounded-2xl border border-border border-b-0 bg-card px-5"
                  >
                    <AccordionTrigger className="text-base md:text-lg font-semibold pt-4">
                      {t("home.rentalImportant.contractTitle")}
                    </AccordionTrigger>
                    <AccordionContent>
                      <SectionCard icon={FileText} color="blue">
                        <p className="text-muted-foreground leading-relaxed">
                          {t("home.rentalImportant.contractBody")}
                        </p>
                      </SectionCard>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : null}
            {!isRental ? (
              <div className="hidden md:block w-full min-w-0">
                <LocationMap
                  title={t("home.landing.productDetail.departurePoint")}
                  product={product}
                  latitude={isTour ? (product as ITourProduct).tour.lat : 0}
                  longitude={isTour ? (product as ITourProduct).tour.long : 0}
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
                "rounded-2xl mb-0 md:mb-6 border border-border bg-card shadow-sm",
                showBookingStatusCard
                  ? "p-0 overflow-hidden"
                  : "px-3 py-2 sm:px-4 sm:py-2.5 md:px-4 md:py-3",
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
                        bookingKind={existingBooking.booking_kind}
                        pickupLocation={existingBooking.pickup_location}
                        dropoffLocation={existingBooking.dropoff_location}
                        pickupTime={existingBooking.pickup_time}
                        dropoffTime={existingBooking.dropoff_time}
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
                        vehicle={vehicle}
                      />
                    ) : (
                      <div className="space-y-2">
                        {hasRentalDetail ? (
                          <RentalBookingForm
                            product={product}
                            setBookingData={handleSetBookingData}
                            showPaymentStep={showPaymentStep}
                            setShowPaymentStep={() => setShowPaymentStep(true)}
                            extraActionBelowBookNow={
                              <div className="space-y-2">
                                {hasAnyProductBooking &&
                                showBookingFormAgain ? (
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
                                ) : null}
                                <RentalImportantInfoModal
                                  trigger="button"
                                  hasDeposit={
                                    isRentalProduct(product)
                                      ? (product.rental?.has_deposit ?? false)
                                      : false
                                  }
                                  depositAmount={
                                    isRentalProduct(product)
                                      ? (product.rental?.deposit_amount ?? null)
                                      : null
                                  }
                                />
                              </div>
                            }
                          />
                        ) : isRental ? (
                          <p className="text-sm text-muted-foreground">
                            {t("home.rentalBooking.incompleteListing")}
                          </p>
                        ) : (
                          <BookingForm
                            key={`booking-form-${bookingFormKey}`}
                            setBookingData={handleSetBookingData}
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
                      value={mobileAccordionOpen}
                      onValueChange={setMobileAccordionOpen}
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
                          {isRental ? (
                            <div className="mb-4">
                              <Accordion type="single" collapsible defaultValue="rental-agreement-mobile">
                                <AccordionItem value="rental-agreement-mobile">
                                  <AccordionTrigger className="text-base font-semibold">
                                    {t("home.rentalImportant.contractTitle")}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <SectionCard icon={FileText} color="blue">
                                      <p className="text-muted-foreground leading-relaxed text-sm">
                                        {t("home.rentalImportant.contractBody")}
                                      </p>
                                    </SectionCard>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          ) : null}
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
                              bookingKind={existingBooking.booking_kind}
                              pickupLocation={existingBooking.pickup_location}
                              dropoffLocation={existingBooking.dropoff_location}
                              pickupTime={existingBooking.pickup_time}
                              dropoffTime={existingBooking.dropoff_time}
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
                                    onClick={() =>
                                      router.push("/account/bookings")
                                    }
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
                              vehicle={vehicle}
                            />
                          ) : (
                            <div className="space-y-2">
                              {hasRentalDetail ? (
                                <RentalBookingForm
                                  product={product}
                                  setBookingData={handleSetBookingData}
                                  showPaymentStep={showPaymentStep}
                                  setShowPaymentStep={() =>
                                    setShowPaymentStep(true)
                                  }
                                  extraActionBelowBookNow={
                                    <div className="space-y-2">
                                      {hasAnyProductBooking &&
                                      showBookingFormAgain ? (
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
                                          {t(
                                            "home.bookingStatus.viewMyTickets",
                                          )}
                                        </Button>
                                      ) : null}
                                      <RentalImportantInfoModal
                                        trigger="button"
                                        hasDeposit={
                                          isRentalProduct(product)
                                            ? (product.rental?.has_deposit ??
                                              false)
                                            : false
                                        }
                                        depositAmount={
                                          isRentalProduct(product)
                                            ? (product.rental?.deposit_amount ??
                                              null)
                                            : null
                                        }
                                      />
                                    </div>
                                  }
                                />
                              ) : isRental ? (
                                <p className="text-sm text-muted-foreground">
                                  {t("home.rentalBooking.incompleteListing")}
                                </p>
                              ) : (
                                <BookingForm
                                  key={`booking-form-${bookingFormKey}`}
                                  setBookingData={handleSetBookingData}
                                  showPaymentStep={showPaymentStep}
                                  setShowPaymentStep={() =>
                                    setShowPaymentStep(true)
                                  }
                                  product={product}
                                  extraActionBelowBookNow={
                                    hasAnyProductBooking &&
                                    showBookingFormAgain ? (
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
            latitude={isTour ? (product as ITourProduct).tour.lat : 0}
            longitude={isTour ? (product as ITourProduct).tour.long : 0}
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
