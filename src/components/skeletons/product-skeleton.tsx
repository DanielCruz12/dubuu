"use client";

export default function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/3 mb-2"></div>
            <div className="h-14 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
