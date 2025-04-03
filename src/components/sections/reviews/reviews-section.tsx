"use client";

import { Separator } from "@/components/ui/separator";
import ReviewSummary from "./reviews-summary";
import ReviewList from "./review-list";
import { useGetReviewsQuery } from "@/redux/slices/product/review-slice";

export default function ReviewSection({ productId }: { productId: string }) {
  const { data: reviews = [], isLoading } = useGetReviewsQuery(productId);

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-xl md:text-2xl font-semibold">Reseñas</h2>
      <ReviewSummary reviews={reviews} />
      <Separator className="dark:border-muted" />
      <ReviewList reviews={reviews} />
      {/* <ReviewForm onSubmitReview={addReview} /> */}
    </div>
  );
}
