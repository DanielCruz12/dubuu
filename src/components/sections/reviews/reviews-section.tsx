"use client";

import { Separator } from "@/components/ui/separator";
import ReviewSummary from "./reviews-summary";
import ReviewList from "./review-list";
import { useGetReviewsQuery } from "@/redux/slices/product/review-slice";
import ReviewForm from "./reviews-form";
import { useGetBookingsByUserIdQuery } from "@/redux/slices/booking/booking-slice";
import { useUser } from "@clerk/nextjs";

export default function ReviewSection({ productId }: { productId: string }) {
  const { user } = useUser();
  const userId = user?.id as string;
  const { data: reviews = [], isLoading } = useGetReviewsQuery(productId);
  const { data: booking = [] } = useGetBookingsByUserIdQuery(userId);

  const addReview = () => {};

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-xl md:text-2xl font-semibold">Reseñas</h2>
      <ReviewSummary reviews={reviews} />
      <Separator className="dark:border-muted" />
      <ReviewList reviews={reviews} />

      {booking.length > 0 && <ReviewForm onSubmitReview={addReview} />}
    </div>
  );
}
