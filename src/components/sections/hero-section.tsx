"use client";

import { useLanguage } from "@/lib/i18n-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeroSection() {
  const { t, isReady } = useLanguage();

  if (!isReady) {
    return (
      <section className="flex justify-between items-end mb-3">
        <div className="w-full max-w-md">
          <Skeleton className="h-4 w-full rounded md:h-5" />
        </div>
      </section>
    );
  }

  return (
    <section className="flex justify-between items-end mb-3 ">
      <div>
        <p className="text-sm md:text-base text-gray-700 dark:text-gray-500">
          {t("home.hero.subtitle")}
        </p>
      </div>
    </section>
  );
}
