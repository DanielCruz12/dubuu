"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useSaveProductMutation,
  useUnsaveProductMutation,
  useGetUserFavoritesQuery,
} from "@/redux/slices/favorite/favorite-slice";
import type { IProduct } from "@/types/product";
import { useLanguage } from "@/lib/i18n-context";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { generateSlug } from "@/lib/utils";
import { getProductDisplayPrice, isRentalProduct } from "@/utils/product-helpers";

/**
 * Card de experiencia con foto grande + overlay oscuro (originalmente creada
 * para "Experiencias destacadas" en la landing). Reutilizada en /home para
 * alquiler de vehículos — mismo look premium, con favoritos siempre visibles.
 */
export function ExperienceCard({
  product,
  index = 0,
  showFavorite = true,
}: {
  product: IProduct;
  index?: number;
  showFavorite?: boolean;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useUser();
  const rental = isRentalProduct(product);
  const price = getProductDisplayPrice(product);
  const rating = Number(product.average_rating) || 0;
  const image = product.banner || product.images?.[0] || "/tour.jpg";

  const { data: favorites } = useGetUserFavoritesQuery(
    { userId: user?.id || "" },
    { skip: !user?.id }
  );
  const [saveProduct, { isLoading: isSaving }] = useSaveProductMutation();
  const [unsaveProduct, { isLoading: isUnsaving }] = useUnsaveProductMutation();
  const isFavorited =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    favorites?.some((fav: any) => fav.productId === product.id) || false;

  const goToDetail = () => {
    const slug = generateSlug(
      product.name,
      product.country,
      product.product_type.name,
      product.product_category?.name
    );
    router.push(`/home/${slug}/${product.id}`);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      toast.error(t("home.tourCard.loginToSave"));
      return;
    }
    try {
      if (isFavorited) {
        await unsaveProduct({ productId: product.id, userId: user.id }).unwrap();
        toast.success(t("home.tourCard.removedFromSaved"));
      } else {
        await saveProduct({ productId: product.id, userId: user.id }).unwrap();
        toast.success(t("home.tourCard.savedSuccess"));
      }
    } catch {
      toast.error(t("home.tourCard.saveError"));
    }
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

        <span className="absolute left-4 top-4 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          {rental ? t("landing.verticals.rental") : t("landing.verticals.tours")}
        </span>

        {showFavorite && (
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 backdrop-blur transition-colors hover:bg-black/70 disabled:opacity-50"
            onClick={toggleFavorite}
            disabled={isSaving || isUnsaving}
            aria-label={
              isFavorited
                ? t("home.tourCard.removeFromFavorites")
                : t("home.tourCard.addToFavorites")
            }
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorited ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          {rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-zinc-300">
              <Star
                className="h-3.5 w-3.5 fill-sand-400 text-sand-400"
                aria-hidden="true"
              />
              {rating.toFixed(1)}
            </div>
          )}
          <h3 className="mt-1 text-xl font-bold leading-tight text-balance line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm">
              <span className="text-white/60">{t("landing.featured.from")}</span>{" "}
              <span className="text-lg font-bold">
                {USD_SYMBOL}
                {formatUsd(price)}
              </span>
            </p>
            <Button
              size="sm"
              className="rounded-full bg-white text-zinc-950 hover:bg-zinc-200"
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

export default ExperienceCard;
