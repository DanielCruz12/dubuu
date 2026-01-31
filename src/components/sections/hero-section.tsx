"use client";

import { useLanguage } from "@/lib/i18n-context";

export default function HeroSection() {
  const { t } = useLanguage();

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
