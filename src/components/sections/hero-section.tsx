"use client";

import { useLanguage } from "@/lib/i18n-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeroSection() {
  const { t, isReady } = useLanguage();

  if (!isReady) {
    return (
      <section className="mb-5 pt-4">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="mt-2 h-8 w-full max-w-md rounded md:h-10" />
      </section>
    );
  }

  return (
    <section className="mb-5 pt-4">
      <p className="font-label text-sm tracking-[2px] text-coast-600 dark:text-coast-300">
        {t("home.hero.eyebrow")}
      </p>
      <h1 className="mt-1 font-display text-2xl font-normal text-foreground sm:text-3xl md:text-4xl">
        {t("home.hero.subtitle")}
      </h1>
    </section>
  );
}
