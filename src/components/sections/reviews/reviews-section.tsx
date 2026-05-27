"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import ReviewSummary from "./reviews-summary";
import ReviewList from "./review-list";
import ReviewForm from "./reviews-form";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info, CheckCircle, Clock } from "lucide-react";
import { ReusableDialog } from "@/components/reusable-dialog";
import type { Booking } from "@/types/booking";
import type { Review } from "@/types/review";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import "moment/locale/es";

interface ReviewSectionProps {
  productId: string;
  /** Reserva del usuario (puede ser Booking o IBookingUser con tourDate) */
  existingBooking?: Booking & { tourDate?: string };
  reviews: Review[];
  isLoading: boolean;
}

export default function ReviewSection({
  productId,
  existingBooking,
  reviews,
  isLoading,
}: ReviewSectionProps) {
  const { t, language } = useLanguage();
  const [openDialogReview, setOpenDialogReview] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();

  if (isLoading) {
    return (
      <div className="mt-6 animate-pulse">{t("home.reviews.loading")}</div>
    );
  }

  // Solo se puede dejar reseña a partir de la fecha del tour (o fin del alquiler)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookingAny = existingBooking as any;
  const isRental = bookingAny?.booking_kind === "rental";
  const reviewDate = isRental
    ? bookingAny?.dropoff_time ?? bookingAny?.tourDate
    : bookingAny?.tourDate;
  const hasTourDatePassed = reviewDate
    ? new Date() >= new Date(reviewDate)
    : false;

  // Determinar el estado del usuario y su reserva
  const userState = {
    isLoggedIn: isUserLoaded && !!user,
    hasBooking: !!existingBooking,
    isBookingCompleted:
      !!existingBooking && existingBooking.status === "completed",
    hasLeftReview:
      !!existingBooking &&
      existingBooking.status === "completed" &&
      !!user &&
      reviews.some((review) => user.id === review.user_id),
    hasTourDatePassed,
    tourDateFormatted: reviewDate
      ? moment(reviewDate)
          .locale(language)
          .format(language === "es" ? "dddd, D [de] MMMM - h:mm A" : "dddd, MMM D - h:mm A")
      : "",
  };

  return (
    <div className="mt-6 space-y-4">
      {reviews.length > 0 && (
        <h2 className="text-xl md:text-2xl font-semibold">{t("home.reviews.title")}</h2>
      )}

      <ReviewSummary reviews={reviews} />
      {reviews.length > 0 && <Separator className="" />}
      <ReviewList reviews={reviews} />

      {/* Sección de interacción del usuario con reseñas - solo mostrar en casos específicos */}
      {renderUserReviewSection(userState)}
    </div>
  );

  // Función para renderizar la sección de reseñas según el estado del usuario
  function renderUserReviewSection(state: {
    isLoggedIn: boolean;
    hasBooking: boolean;
    isBookingCompleted: boolean;
    hasLeftReview: boolean;
    hasTourDatePassed: boolean;
    tourDateFormatted: string;
  }) {
    // Si el usuario no está logueado o no tiene reserva, no mostrar nada
    if (!state.isLoggedIn || !state.hasBooking) {
      return null;
    }

    // Si el usuario ya dejó una reseña, mostrar mensaje de agradecimiento
    if (state.hasLeftReview) {
      return (
        <div className="mt-6 p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/10 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h3 className="font-medium text-green-800 dark:text-green-400">
              {t("home.reviews.thanksTitle")}
            </h3>
          </div>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300 pl-6">
            {t("home.reviews.thanksDescription")}
          </p>
        </div>
      );
    }

    // Si el usuario tiene una reserva pero no está completada
    if (!state.isBookingCompleted) {
      return null;
    }

    // Reserva completada pero aún no ha pasado la fecha del tour: no puede reseñar hasta ese día
    if (state.isBookingCompleted && !state.hasTourDatePassed && state.tourDateFormatted) {
      return (
        <div className="mt-6 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{t("home.reviews.leaveReview")}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground pl-6">
            {t("home.reviews.reviewAvailableFrom").replace("{date}", state.tourDateFormatted)}
          </p>
        </div>
      );
    }

    // Si el usuario tiene una reserva completada y ya pasó la fecha del tour
    if (state.isBookingCompleted && state.hasTourDatePassed) {
      return (
        <div className="mt-6 p-4 border rounded-lg">
          <div className="flex items-center mb-2">
            <h3 className="text-lg md:text-xl font-semibold">
              {t("home.reviews.leaveReview")}
            </h3>
            <Popover>
              <PopoverTrigger className="px-2 ml-2">
                <Info className="h-4 w-4" />
                <span className="sr-only">{t("home.reviews.srInfo")}</span>
              </PopoverTrigger>
              <PopoverContent className="max-w-xs">
                <p className="text-sm text-muted-foreground">
                  {t("home.reviews.reviewInfo")}
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t("home.reviews.reviewIntro")}
          </p>

          <ReusableDialog
            trigger={
              <Button variant="outline" className="text-sm">
                {t("home.reviews.shareExperience")}
              </Button>
            }
            title={t("home.reviews.writeReviewTitle")}
            description={t("home.reviews.writeReviewDescription")}
            className=""
            open={openDialogReview}
            onOpenChange={setOpenDialogReview}
          >
            <ReviewForm
              setOpenDialogReview={setOpenDialogReview}
              productId={productId}
            />
          </ReusableDialog>
        </div>
      );
    }

    // En cualquier otro caso, no mostrar nada
    return null;
  }
}
