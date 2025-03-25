// Rating.tsx
import { Star } from "lucide-react";
import React from "react";

export interface RatingProps {
  averageRating: number | string;
  reviewsCount: number;
  maxStars?: number;
  inactiveStarClassName?: string;
  activeStarClassName?: string;
}

const formatRating = (rating: number): string =>
  rating.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export const Rating: React.FC<RatingProps> = ({
  averageRating,
  reviewsCount,
  maxStars = 5,
  inactiveStarClassName = "text-gray-300",
  activeStarClassName = "text-yellow-400 fill-yellow-400",
}) => {
  const ratingValue =
    typeof averageRating === "string" ? Number(averageRating) : averageRating;
  const finalRating = isNaN(ratingValue) ? 0 : ratingValue;
  const formattedRating = formatRating(finalRating);

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: maxStars }, (_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.round(finalRating)
              ? activeStarClassName
              : inactiveStarClassName
          }`}
        />
      ))}
      <span className="font-normal">{formattedRating}</span>
      <span className="text-muted-foreground text-sm">
        {reviewsCount === 0
          ? "(No reviews)"
          : reviewsCount > 1
            ? `(${reviewsCount} reviews)`
            : "(1 review)"}
      </span>
    </div>
  );
};

export default Rating;
