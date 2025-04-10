import { Review } from "@/types/review";
import StarRating from "./start-rating";

interface ReviewSummaryProps {
  reviews: Review[];
}

export default function ReviewSummary({ reviews }: ReviewSummaryProps) {
  // 1. Total de reseñas
  const totalReviews = reviews.length;

  // 2. Promedio de calificaciones
  const sumRatings = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

  // Formatear el promedio en estilo español (por ejemplo, "4,0")
  const formattedRating = averageRating.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  // 3. Desglose (breakdown) de cuántas reseñas hay por cada estrella
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  // Si solo hay 1 reseña, mostramos únicamente la fila con count > 0
  const displayedBreakdown =
    totalReviews === 1 ? breakdown.filter(({ count }) => count > 0) : breakdown;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
      {/* Bloque Resumen */}
      <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-amber-950/20 dark:to-yellow-900/10 rounded-lg shadow-sm w-full md:w-auto border border-yellow-100 dark:border-yellow-900/30">
        <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
          {formattedRating}
        </span>
        <div className="flex mt-3 justify-center w-full">
          <StarRating
            value={averageRating}
            size="large"
            className="drop-shadow-sm"
          />
        </div>
        <span className="text-sm text-muted-foreground mt-2">
          Basado en {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
        </span>
      </div>

      {/* Bloque Breakdown */}
      <div className="flex-1 w-full px-2">
        <h3 className="text-base font-medium mb-4">
          Desglose de la calificación
        </h3>
        {displayedBreakdown.map(({ star, percentage }) => (
          <div key={star} className="flex items-center gap-2 mb-3 group">
            <div className="flex items-center w-8">
              <span className="text-sm font-medium">{star}</span>
            </div>
            <div className="flex-1 h-3 bg-muted dark:bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300 group-hover:from-yellow-500 group-hover:to-amber-600"
                style={{ width: `${percentage}%` }}
              />
            </div>
           
          </div>
        ))}
      </div>
    </div>
  );
}
