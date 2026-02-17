"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ReviewSheet } from "@/components/reusable-sheet";
import type { Review } from "@/types/review";
import { ReviewCard } from "./review-card";
import { useLanguage } from "@/lib/i18n-context";

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const { t } = useLanguage();
  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-3">
        {reviews.length > 0 && (
          <h3 className="text-lg font-medium">{t("home.reviews.title")} ({reviews.length})</h3>
        )}

        <ReviewSheet triggerText={t("home.reviews.viewAllReviews")}>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground px-4">
              {t("home.reviews.noReviewsYet")}
            </p>
          ) : (
            <div className=" space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </ReviewSheet>
      </div>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">
          {t("home.reviews.noReviewsYet")}
        </p>
      ) : (
        <ScrollArea type="always" className="max-h-[450px] rounded-md p-1">
          <div className="space-y-4 pr-4 max-h-[450px]">
            {reviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )}
    </div>
  );
}
