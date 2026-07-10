"use client";

import { motion } from "framer-motion";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import { useLanguage } from "@/lib/i18n-context";
import DotGridBackground from "@/components/sections/dot-grid-background";
import ExperienceCard from "@/components/experience-card";

export default function FeaturedExperiences() {
  const { t } = useLanguage();
  const { data, isLoading } = useGetProductsQuery({
    limit: 8,
    is_approved: true,
    is_active: true,
  });

  const products = (Array.isArray(data?.data) ? data.data : []).slice(0, 8);

  if (!isLoading && products.length === 0) return null;

  return (
    <section
      className="relative py-20 md:py-28 px-4 md:px-20 bg-zinc-950"
      aria-labelledby="featured-heading"
    >
      <DotGridBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-2xl mb-12"
      >
        <h2
          id="featured-heading"
          className="font-display text-3xl md:text-5xl font-normal tracking-tight text-white text-balance"
        >
          {t("landing.featured.titlePrefix")}
          <em className="italic text-zinc-500">
            {t("landing.featured.titleEmphasis")}
          </em>
          {t("landing.featured.titleSuffix")}
        </h2>
        <p className="mt-4 text-zinc-400 text-base md:text-lg">
          {t("landing.featured.subtitle")}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] w-full animate-pulse rounded-3xl bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map((product, i) => (
            <ExperienceCard
              key={product.id}
              product={product}
              index={i}
              showFavorite={false}
            />
          ))}
        </div>
      )}
    </section>
  );
}
