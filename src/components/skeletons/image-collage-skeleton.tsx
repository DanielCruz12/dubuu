"use client";

export default function ImageCollageSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
      <div className="animate-pulse">
        {/* Rating Skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
          <div className="w-12 h-4 bg-gray-300 rounded-md"></div>
          <div className="w-24 h-4 bg-gray-300 rounded-md"></div>
        </div>

        {/* Title Skeleton */}
        <div className="w-3/4 h-6 bg-gray-300 rounded-md mb-2"></div>
      </div>
      {/* Mobile view - Carousel Skeleton */}
      <div className="md:hidden mb-4">
        <div className="w-full h-[200px] bg-gray-300 rounded-lg"></div>
      </div>

      {/* Desktop view - Grid Skeleton */}
      <div className="hidden md:grid grid-cols-4 gap-2 container mx-auto h-[450px]">
        {/* Banner skeleton */}
        <div className="col-span-2 row-span-2 bg-gray-300 rounded-lg"></div>

        {/* Small image skeletons */}
        <div className="bg-gray-300 rounded-lg"></div>
        <div className="bg-gray-300 rounded-lg"></div>
        <div className="bg-gray-300 rounded-lg"></div>
        <div className="bg-gray-300 rounded-lg"></div>
      </div>
    </section>
  );
}
