import { ScrollArea } from "@/components/ui/scroll-area";
import { ReviewSheet } from "@/components/reusable-sheet";
import type { Review } from "@/types/review";
import { ReviewCard } from "./review-card";

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium ">
          Comentarios de clientes ({reviews.length})
        </h3>

        <ReviewSheet triggerText="Ver todos los comentarios">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground px-4">
              Aún no hay reseñas. ¡Sé el primero en dejar una!
            </p>
          ) : (
            <div className="space-y-4 pr-2">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </ReviewSheet>
      </div>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">
          Aún no hay reseñas. ¡Sé el primero en dejar una!
        </p>
      ) : (
        <ScrollArea className="max-h-[500px] rounded-md dark:border-muted">
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
