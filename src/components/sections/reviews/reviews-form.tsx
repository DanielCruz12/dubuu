"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Review } from "@/types/review";
import StarRating from "./start-rating";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

interface ReviewFormProps {
  onSubmitReview: (review: Review) => void;
}

export default function ReviewForm({ onSubmitReview }: ReviewFormProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      setUsername(user.fullName || "");
      setEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      alert("You can upload a maximum of 2 images.");
      return;
    }
    setImages(files);
  };

  const handleSubmitReview = () => {
    if (rating === 0 || review.trim().length < 100) {
      alert("Please provide a rating and a review with at least 100 characters.");
      return;
    }

    setIsSubmitting(true);

    const newReview: Review = {
      id: Date.now().toString(),
      username,
      email,
      rating,
      review,
      images, // optional: depends on your backend or parent component handling
    };

    console.log("Submitting review:", newReview);

    onSubmitReview(newReview);

    setRating(0);
    setReview("");
    setImages([]);
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              disabled
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
          <Textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this tour..."
            rows={4}
            required
            className="bg-background dark:bg-background/80"
          />
          <p className="text-sm text-muted-foreground">
            {review.length} / 100 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="images">Upload Photos (max 2)</Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="bg-background dark:bg-background/80"
          />
          <div className="flex gap-2 mt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden">
                <Image
                  src={URL.createObjectURL(img)}
                  alt={`preview-${idx}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmitReview}
          disabled={isSubmitting || rating === 0 || review.trim().length < 100}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white dark:from-amber-600 dark:to-yellow-500 dark:hover:from-amber-700 dark:hover:to-yellow-600 transition-all duration-300"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
