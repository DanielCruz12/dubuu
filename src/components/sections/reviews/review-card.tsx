"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import moment from "moment"
import type { Review } from "@/types/review"
import StarRating from "./start-rating"

export function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const MAX_LENGTH = 120

  const isLong = review.review.length > MAX_LENGTH
  const displayText = expanded ? review.review : review.review.slice(0, MAX_LENGTH)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Avatar Section */}
          <Avatar className="h-12 w-12 border shadow-sm">
            <AvatarImage src={review.image_url} alt={review.username} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {review.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Content Section */}
          <div className="flex-1 space-y-3">
            {/* Header with username, badge and date */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{review.username}</h4>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  >
                    Verificado
                  </Badge>
                </div>
                <div className="flex">
                  <StarRating value={review.rating} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{moment(review.created_at).fromNow()}</span>
            </div>

            {/* Review text */}
            <div className="text-sm text-muted-foreground">
              <p>
                {displayText}
                {isLong && !expanded && "..."}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded((prev) => !prev)}
                  className="text-primary hover:underline text-xs font-medium mt-1"
                >
                  {expanded ? "Ver menos" : "Ver más"}
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
