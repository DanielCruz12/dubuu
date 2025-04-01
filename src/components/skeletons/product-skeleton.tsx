"use client";

import { Skeleton } from "../ui/skeleton";

export default function ProductsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
      <div className="animate-pulse">
        {/* Rating Skeleton */}
        <div className="animate-pulse flex items-center gap-2 mb-2">
          <div className="animate-pulse w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="animate-pulse w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="animate-pulse w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>

        {/* Title Skeleton */}
        <div className="animate-pulse w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
      </div>
      {/* Mobile view - Carousel Skeleton */}
      <div className="animate-pulse md:hidden mb-4">
        <div className="animate-pulse w-full h-[200px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>

      {/* Desktop view - Grid Skeleton */}
      <div className="animate-pulse hidden md:grid grid-cols-4 gap-2 container mx-auto h-[450px]">
        {/* Banner skeleton */}
        <div className="col-span-2 row-span-2 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>

        {/* Small image skeletons */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>

      <div className="flex overflow-x-auto gap-4 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[130px] md:min-w-[200px] p-2 border rounded-lg"
          >
            <Skeleton className="h-4 w-12 mb-2 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 space-y-6">
          {["Overview", "Highlight", "What's Included", "Itinerary"].map(
            (title, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            )
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            <Skeleton className="h-6 w-32 mb-2 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-muted rounded-lg border shadow-md p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
