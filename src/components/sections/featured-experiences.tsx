"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import type { IProduct } from "@/types/product";
import { useLanguage } from "@/lib/i18n-context";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { generateSlug } from "@/lib/utils";
import {
  getProductDisplayPrice,
  isRentalProduct,
  isTourProduct,
} from "@/utils/product-helpers";

function FeaturedCard({ product, index }: { product: IProduct; index: number }) {
  const { t } = useLanguage();
  const router = useRouter();
  const rental = isRentalProduct(product);
  const tour = isTourProduct(product);
  const price = getProductDisplayPrice(product);
  const rating = Number(product.average_rating) || 0;
  const image = product.banner || product.images?.[0] || "/tour.jpg";

  const durationLabel =
    tour && product.tour?.duration
      ? t("landing.featured.durationHours").replace(
          "{n}",
          String(product.tour.duration)
        )
      : rental
        ? t("landing.featured.perDay")
        : t("landing.verticals.tours");

  const goToDetail = () => {
    const slug = generateSlug(
      product.name,
      product.country,
      product.product_type.name,
      product.product_category?.name
    );
    router.push(`/home/${slug}/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group cursor-pointer"
      onClick={goToDetail}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToDetail();
      }}
      aria-label={`${product.name} — ${t("landing.featured.viewDetails")}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-muted">
        <Image
          src={image}
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 23vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-coast-700">
          {rental ? t("landing.verticals.rental") : t("landing.verticals.tours")}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="flex items-center gap-1.5 text-sm text-sand-200">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{durationLabel}</span>
            {rating > 0 && (
              <span className="ml-2 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-sand-300 text-sand-300" aria-hidden="true" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="mt-1 font-serif text-xl font-semibold leading-tight text-balance line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm">
              <span className="text-white/70">{t("landing.featured.from")}</span>{" "}
              <span className="text-lg font-bold">
                {USD_SYMBOL}
                {formatUsd(price)}
              </span>
            </p>
            <Button
              size="sm"
              className="rounded-full bg-white text-coast-800 hover:bg-sand-200"
              onClick={(e) => {
                e.stopPropagation();
                goToDetail();
              }}
            >
              {t("landing.featured.book")}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
      className="pt-28 md:pt-24 pb-20 md:pb-28 px-4 md:px-20"
      aria-labelledby="featured-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-volcanic-600">
          {t("landing.featured.eyebrow")}
        </p>
        <h2
          id="featured-heading"
          className="mt-3 font-serif text-3xl md:text-5xl font-semibold tracking-tight text-balance"
        >
          {t("landing.featured.title")}
        </h2>
        <p className="mt-4 text-muted-foreground text-base md:text-lg">
          {t("landing.featured.subtitle")}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] w-full animate-pulse rounded-3xl bg-muted"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <FeaturedCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
