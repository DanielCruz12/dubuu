"use client";

export default function ImageCollageSkeleton() {
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
    </section>
  );
}
