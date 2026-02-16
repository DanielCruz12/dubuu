"use client";
import Image from "next/image";
import { destinations } from "@/utils/data";
import { useCurrency } from "@/hooks/use-currency-converter";
import { useLanguage } from "@/lib/i18n-context";
import { Skeleton } from "@/components/ui/skeleton";

function PopularDestinationsSkeleton() {
  return (
    <section className="py-12">
      <div className="space-y-3">
        <Skeleton className="h-8 w-64 md:h-9 md:w-80" />
        <Skeleton className="h-4 w-full max-w-xl md:h-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden shadow-lg border border-border/50"
            >
              <Skeleton className="h-20 md:h-24 w-full rounded-none" />
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-7 flex-1 max-w-[140px]" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PopularDestinations() {
  const { convert, symbol } = useCurrency();
  const { t, isReady } = useLanguage();

  if (!isReady) {
    return <PopularDestinationsSkeleton />;
  }

  return (
    <section className="py-12">
      <div className="space-y-3">
        <h2 className="text-xl md:text-3xl font-bold">{t("home.popularDestinations.title")}</h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {t("home.popularDestinations.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {destinations.map((destination) => (
            <div
              /*  onClick={() => navigateToTour(destination.country)} */
              key={destination.id}
              className="rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-20 md:h-24">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-2xl font-semibold mr-2">
                      {destination.name}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base ml-2">
                      {symbol}
                      {convert(destination.priceRange)}{" "}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">
                  {destination.tours} {t("home.popularDestinations.tours")}, {destination.activities}{" "}
                  {t("home.popularDestinations.activities")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
