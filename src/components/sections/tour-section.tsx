"use client";

import { TourCard } from "@/components/tour-card";
import { TourCardSkeleton } from "../skeletons/tour-card-skeleton";
import type { IProduct } from "@/types/product";
import { Button } from "../ui/button";
import { NoSearchResults } from "../not-results-found";

export default function TourSection({
  products,
  isLoading,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: {
  products: IProduct[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}) {
  if (isLoading) {
    return <TourCardSkeleton />;
  }

  if (products.length === 0) {
    return <NoSearchResults />;
  }

  return (
    <section className="py-4 sm:py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((tour) => (
          <div key={tour.id} className="tour-card-container">
            <TourCard {...tour} />
          </div>
        ))}
      </div>

      {/* Botón de cargar más (si se proporciona la función onLoadMore) */}
      {onLoadMore && hasMore && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="group w-full sm:w-auto max-w-xs"
          >
            {isLoadingMore ? "Cargando..." : "Cargar más"}
          </Button>
        </div>
      )}
    </section>
  );
}
