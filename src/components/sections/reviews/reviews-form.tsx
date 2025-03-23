"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Review } from "@/types/review";
import StarRating from "./start-rating";

interface ReviewFormProps {
  onSubmitReview: (review: Review) => void;
}

export default function ReviewForm({ onSubmitReview }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState(""); // Changed from comment to review
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del usuario de localStorage si están disponibles
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmitReview = () => {
    if (rating === 0 || !review.trim()) {
      // Changed from comment to review
      alert("Please provide both a rating and a review");
      return;
    }

    setIsSubmitting(true);

    // Guardar datos del usuario en localStorage para futuros usos
    if (name) localStorage.setItem("userName", name);
    if (email) localStorage.setItem("userEmail", email);

    // Crear nueva reseña
    const newReview: Review = {
      id: Date.now().toString(),
      name,
      email,
      rating,
      review, // Changed from comment to review
    };

    console.log("Submitting review:", newReview);

    // Enviar la reseña al componente padre
    onSubmitReview(newReview);

    // Reiniciar formulario
    setRating(0);
    setReview(""); // Changed from comment to review
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-900/20 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="bg-background dark:bg-background/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-background dark:bg-background/80"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Rating</Label>
          <div className="w-full flex justify-center sm:justify-start">
            <StarRating
              value={rating}
              interactive={true}
              size="large"
              onChange={setRating}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review">Your Review</Label>
          review
          <Textarea
            id="review" // Changed from comment to review
            value={review} // Changed from comment to review
            onChange={(e) => setReview(e.target.value)} // Changed from comment to review
            placeholder="Share your experience with this tour..."
            rows={4}
            required
            className="bg-background dark:bg-background/80"
          />
        </div>

        <Button
          onClick={handleSubmitReview}
          disabled={isSubmitting || rating === 0 || !review.trim()} // Changed from comment to review
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white dark:from-amber-600 dark:to-yellow-500 dark:hover:from-amber-700 dark:hover:to-yellow-600 transition-all duration-300"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
