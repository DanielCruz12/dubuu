"use client";
// Rating.tsx
import { Star } from "lucide-react";
import React from "react";
import { useLanguage } from "@/lib/i18n-context";

export interface RatingProps {
  averageRating: number | string;
  hideReviewCount?: boolean;
  reviewsCount: number;
  maxStars?: number;
  inactiveStarClassName?: string;
  activeStarClassName?: string;
  isMobileOptimized?: boolean;
}

const formatRating = (rating: number): string =>
  rating.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export const Rating: React.FC<RatingProps> = ({
  averageRating,
  reviewsCount,
  hideReviewCount = false,
  maxStars = 5,
  inactiveStarClassName = "text-gray-300",
  activeStarClassName = "text-yellow-400 fill-yellow-400",
  isMobileOptimized = false,
}) => {
  const { t } = useLanguage();
  const ratingValue =
    typeof averageRating === "string" ? Number(averageRating) : averageRating;
  const finalRating = isNaN(ratingValue) ? 0 : ratingValue;
  const formattedRating = formatRating(finalRating);

  const reviewText =
    reviewsCount === 0
      ? t("home.reviews.noReviews")
      : reviewsCount === 1
        ? t("home.reviews.oneReview")
        : t("home.reviews.reviewsCount").replace("{count}", String(reviewsCount));

  return (
    <div
      className={`flex items-center ${isMobileOptimized ? "gap-1" : "gap-2"}`}
    >
      {/* Estrellas solo visibles en MD y superiores */}
      <div className="hidden md:flex">
        {Array.from({ length: maxStars }, (_, i) => (
          <Star
            key={i}
            className={`${isMobileOptimized ? "w-3 h-3" : "w-4 h-4"} ${
              i < Math.round(finalRating)
                ? activeStarClassName
                : inactiveStarClassName
            }`}
          />
        ))}
      </div>

      {/* Calificación numérica */}
      <span
        className={`font-medium ${isMobileOptimized ? "text-sm" : "text-base"}`}
      >
        {formattedRating}
      </span>

      {/* Número de reseñas */}
      {!hideReviewCount && (
        <span
        className={`text-muted-foreground ${isMobileOptimized ? "text-xs" : "text-sm"} truncate`}
      >
          {reviewText}
        </span>
      )}
    </div>
  );
};

export default Rating;
