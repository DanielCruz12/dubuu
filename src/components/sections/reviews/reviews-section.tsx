"use client";

import { useState, useEffect } from "react";
import type { IProduct } from "@/types/product";
import { Separator } from "@/components/ui/separator";
import type { Review } from "@/types/review";
import ReviewSummary from "./reviews-summary";
import ReviewList from "./review-list";
import ReviewForm from "./reviews-form";

export default function ReviewSection({ product }: { product: IProduct }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  console.log(product);

  // Cargar reseñas de ejemplo
  useEffect(() => {
    // Reseñas de ejemplo para demostración
    const sampleReviews = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        rating: 4,
        comment:
          "Amazing experience! The tour was well organized and our guide was very knowledgeable. Would definitely recommend to anyone looking for an authentic adventure.",
        date: "2023-12-15",
        isVerified: true,
        likes: 12,
        replies: 2,
      },
      {
        id: "2",
        name: "John Doe",
        email: "john@example.com",
        rating: 4,
        comment:
          "Amazing experience! The tour was well organized and our guide was very knowledgeable. Would definitely recommend to anyone looking for an authentic adventure.",
        date: "2023-12-15",
        isVerified: true,
        likes: 12,
        replies: 2,
      },
    
    ];

    setReviews(sampleReviews);
  }, []);

  // Función para agregar una nueva reseña
  const addReview = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
  };

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-xl md:text-2xl font-semibold">Reviews</h2>
      <ReviewSummary reviews={reviews} />
      <Separator className="dark:border-muted" />
      <ReviewList reviews={reviews} />
      <ReviewForm onSubmitReview={addReview} />
    </div>
  );
}
