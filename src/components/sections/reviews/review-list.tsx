import { ThumbsUp, MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Review } from "@/types/review"
import StarRating from "./start-rating"

interface ReviewListProps {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Customer Reviews ({reviews.length})</h3>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
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
                          <StarRating value={review.rating} />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>

                    <p className="text-sm my-3 line-clamp-3 ">{review.comment}</p>

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
  )
}

