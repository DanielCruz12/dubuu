'use client'
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "./start-rating";
import type { Review } from "@/types/review";

export function ReviewCard({ review }: { review: Review }) {
    const [expanded, setExpanded] = useState(false);
    const MAX_LENGTH = 120;
  
    const isLong = review.review.length > MAX_LENGTH;
    const displayText = expanded
      ? review.review
      : review.review.slice(0, MAX_LENGTH);
    const toggleText = isLong ? (
      <span
        onClick={() => setExpanded((prev) => !prev)}
        className="text-sm text-primary underline cursor-pointer ml-1"
      >
        {expanded ? "ver menos" : "...ver más"}
      </span>
    ) : null;
  
    return (
      <div
        key={review.id}
        className="py-4 px-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border dark:border-muted">
            <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
              {review.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{review.username}</h4>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  >
                    Verificado
                  </Badge>
                </div>
                <div className="flex mt-1">
                  <StarRating value={review.rating} />
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {review.created_at}
              </span>
            </div>
  
            <p className="text-sm my-3 line-clamp-none">
              {displayText}
              {toggleText}
            </p>
          </div>
        </div>
      </div>
    );
  }