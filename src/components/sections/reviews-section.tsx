"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IProduct } from "@/types/product";

interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  date: string;
  isVerified?: boolean;
  likes?: number;
  replies?: number;
}

export default function ReviewSection({ product }: { product: IProduct }) {
  console.log(product);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user data from localStorage if available
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);

    // Sample reviews for demonstration
    const sampleReviews = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        rating: 5,
        comment:
          "Amazing experience! The tour was well organized and our guide was very knowledgeable. Would definitely recommend to anyone looking for an authentic adventure.",
        date: "2023-12-15",
        isVerified: true,
        likes: 12,
        replies: 2,
      },
      {
        id: "2",
        name: "Sarah Smith",
        email: "sarah@example.com",
        rating: 4,
        comment:
          "Great tour overall. The sights were beautiful, though it was a bit rushed at times. The guide was friendly and accommodating to everyone's needs.",
        date: "2023-11-28",
        isVerified: true,
        likes: 8,
        replies: 1,
      },
    ];

    setReviews(sampleReviews);
  }, []);

  const handleSubmitReview = () => {
    if (rating === 0 || !comment.trim()) {
      alert("Please provide both a rating and a comment");
      return;
    }

    setIsSubmitting(true);

    // Save user data to localStorage for future use
    if (name) localStorage.setItem("userName", name);
    if (email) localStorage.setItem("userEmail", email);

    // Create new review
    const newReview: Review = {
      id: Date.now().toString(),
      name,
      email,
      rating,
      comment,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
      replies: 0,
    };

    // In a real app, you would send this to your API
    console.log("Submitting review:", newReview);

    // For demo purposes, just add it to the local state
    setReviews([newReview, ...reviews]);

    // Reset form
    setRating(0);
    setComment("");
    setIsSubmitting(false);
  };

  const renderStars = (
    value: number,
    interactive = false,
    size = "default"
  ) => {
    const starSizeClasses = {
      small: "w-4 h-4",
      default: "w-5 h-5",
      large: "w-6 h-6 sm:w-7 sm:h-7",
    };

    const containerClasses = interactive
      ? "flex justify-between w-full max-w-[200px] sm:max-w-[250px]"
      : "flex gap-1";

    return (
      <div className={containerClasses}>
        {Array(5)
          .fill(0)
          .map((_, index) => {
            const starValue = index + 1;
            const filled = interactive
              ? (hoveredRating || rating) >= starValue
              : value >= starValue;

            return (
              <Star
                key={index}
                className={`${starSizeClasses[size as keyof typeof starSizeClasses]} ${filled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"} ${interactive ? "cursor-pointer transition-colors" : ""}`}
                onClick={interactive ? () => setRating(starValue) : undefined}
                onMouseEnter={
                  interactive ? () => setHoveredRating(starValue) : undefined
                }
                onMouseLeave={
                  interactive ? () => setHoveredRating(0) : undefined
                }
              />
            );
          })}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-xl md:text-2xl font-semibold">Reviews</h2>

      {/* Review Summary */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex flex-col items-center p-6 bg-muted/30 dark:bg-muted/10 rounded-lg shadow-sm w-full md:w-auto">
          <span className="text-2xl font-bold">{calculateAverageRating()}</span>
          <div className="flex mt-2 justify-center w-full">
            {renderStars(Number(calculateAverageRating()), false, "large")}
          </div>
          <span className="text-sm text-muted-foreground mt-1">
            Based on {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="flex-1 w-full px-2">
          <h3 className="text-base font-medium mb-4">Rating Breakdown</h3>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percentage = reviews.length
              ? (count / reviews.length) * 100
              : 0;

            return (
              <div key={star} className="flex items-center gap-2 mb-2">
                <span className="w-6 text-sm">{star} star</span>
                <div className="flex-1 h-2 bg-muted dark:bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="dark:border-muted" />

      {/* Review List */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          Customer Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">
            No reviews yet. Be the first to leave a review!
          </p>
        ) : (
          <ScrollArea className="h-[500px] rounded-md dark:border-muted">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-5 bg-background dark:bg-muted/5 border dark:border-muted rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border dark:border-muted">
                      <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
                        {review.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{review.name}</h4>
                            {review.isVerified && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              >
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.date}
                        </span>
                      </div>

                      <p className="text-sm my-3 line-clamp-3 ">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({review.likes || 0})</span>
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reply ({review.replies || 0})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Write a Review */}
      <div className="bg-muted/20 dark:bg-muted/5 p-2 rounded-lg shadow-sm">
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
              {renderStars(0, true, "large")}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this tour..."
              rows={4}
              required
              className="bg-background dark:bg-background/80"
            />
          </div>

          <Button
            onClick={handleSubmitReview}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="bg-black text-white hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
