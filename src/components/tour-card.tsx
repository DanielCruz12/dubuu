/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import type React from "react";
import { useState, useRef, useEffect, type TouchEvent } from "react";
import {
  Armchair,
  ChevronLeft,
  ChevronRight,
  Cog,
  Droplets,
  Heart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { IProduct } from "@/types/product";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  useSaveProductMutation,
  useUnsaveProductMutation,
  useGetUserFavoritesQuery,
} from "@/redux/slices/favorite/favorite-slice";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { useLanguage } from "@/lib/i18n-context";
import {
  getProductDisplayPrice,
  isRentalProduct,
} from "@/utils/product-helpers";
import RentalImportantInfoModal from "@/components/sections/rental-important-info-modal";

export function TourCard(props: IProduct & { isMobileOptimized?: boolean }) {
  const {
    id,
    name,
    description,
    country,
    banner,
    images,
    average_rating,
    product_category,
    product_type,
  } = props;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useUser();
  const convert = formatUsd;
  const symbol = USD_SYMBOL;
  const { t } = useLanguage();
  const displayPrice = getProductDisplayPrice(props);
  const isRental = isRentalProduct(props);
  const rent = isRental ? props.rental : null;
  const fuelLbl = rent ? t(`home.rentalSpecs.fuel.${rent.fuel_type}`) : "";
  const transLbl = rent
    ? t(`home.rentalSpecs.transmissionKind.${rent.transmission}`)
    : "";
  const vehicleTitle = rent ? `${rent.brand} ${rent.model}`.trim() : "";
  const priceSuffix = isRental
    ? t("home.tourCard.perDay")
    : t("home.tourCard.perPerson");

  // Get favorites from API
  const { data: favorites } = useGetUserFavoritesQuery(
    { userId: user?.id || "" },
    { skip: !user?.id },
  );

  // Check if this product is in favorites
  const isFavorited =
    favorites?.some((fav: any) => fav.productId === id) || false;

  // Mutations for saving/unsaving products
  const [saveProduct, { isLoading: isSaving }] = useSaveProductMutation();
  const [unsaveProduct, { isLoading: isUnsaving }] = useUnsaveProductMutation();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1,
      );
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1,
      );
    }

    if (isRightSwipe && images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1,
      );
    }

    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };

  const toggleFavorite = async (productId: string) => {
    if (!user?.id) {
      toast.error(t("home.tourCard.loginToSave"));
      return;
    }

    try {
      if (isFavorited) {
        await unsaveProduct({
          productId,
          userId: user.id,
        }).unwrap();
        toast.success(t("home.tourCard.removedFromSaved"));
      } else {
        await saveProduct({
          productId,
          userId: user.id,
        }).unwrap();
        toast.success(t("home.tourCard.savedSuccess"));
      }
    } catch (error) {
      toast.error(t("home.tourCard.saveError"));
      console.error("Error toggling favorite:", error);
    }
  };

  const navigateToTour = (name: string, id: string, country: string) => {
    const slug = generateSlug(
      name,
      country,
      product_type.name,
      product_category?.name,
    );
    router.push(`/home/${slug}/${id}`);
  };

  // Safely handle images: prefer banner first, then the rest (deduped)
  const productImages = (() => {
    const candidates = [banner, ...(images ?? [])].filter(
      (src): src is string => typeof src === "string" && src.trim().length > 0,
    );
    const seen = new Set<string>();
    const unique = candidates.filter((src) => {
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });
    return unique.length > 0 ? unique : ["/tour.jpg"];
  })();

  // Formatear el rating para que tenga un decimal
  const formattedRating = Number(average_rating).toFixed(2);

  // Versión móvil (simplificada)
  if (isMobile) {
    return (
      <Card
        className="overflow-hidden rounded-xl border-none shadow-sm h-full cursor-pointer"
        onClick={() => navigateToTour(name, id, country)}
      >
        <div
          ref={carouselRef}
          className="relative rounded-t-lg overflow-hidden aspect-[4/3]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-full">
            {productImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentImageIndex
                    ? "opacity-100 translate-x-0"
                    : index < currentImageIndex
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                }`}
              >
                <Image
                  src={image || "/tour.jpg"}
                  alt={`${name} - Image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Badge de categoría o destacado */}
          {product_category && (
            <Badge className="absolute top-2 left-2 bg-black/60 text-white hover:bg-black/80 z-10">
              {product_category.name}
            </Badge>
          )}

          {/* Calificación + botón de favorito, juntos */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
            {Number(average_rating) > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-white/40 dark:bg-black/40 px-2 py-1 text-[11px] font-medium">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                {formattedRating}
              </span>
            )}
            <button
              className="bg-white/40 hover:bg-white/60 dark:bg-black/40 dark:hover:bg-black/60 p-1.5 rounded-full transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(id);
              }}
              disabled={isSaving || isUnsaving}
              aria-label={
                isFavorited
                  ? t("home.tourCard.removeFromFavorites")
                  : t("home.tourCard.addToFavorites")
              }
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorited
                    ? "fill-rose-500 text-rose-500"
                    : "text-gray-700 dark:text-white stroke-[2.5px] hover:text-rose-400"
                } ${isSaving || isUnsaving ? "opacity-50" : ""}`}
              />
            </button>
          </div>

          {/* Indicadores de imagen (solo si hay más de una) */}
          {productImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {productImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-2 w-full min-w-0">
          <div className="flex flex-col gap-1 w-full min-w-0">
            {isRental && rent ? (
              <>
                <div>
                  <p className="text-sm font-bold leading-tight line-clamp-1">
                    {vehicleTitle}
                  </p>
                  {product_category?.name ? (
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {product_category.name}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium">
                    <Armchair
                      className="h-3 w-3 text-muted-foreground"
                      aria-hidden
                    />
                    {rent.seating_capacity}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium">
                    <Cog
                      className="h-3 w-3 text-muted-foreground"
                      aria-hidden
                    />
                    {transLbl}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium">
                    <Droplets
                      className="h-3 w-3 text-muted-foreground"
                      aria-hidden
                    />
                    {fuelLbl}
                  </span>
                </div>
              </>
            ) : (
              <div>
                <div className="text-xs font-semibold line-clamp-1 w-full">
                  {name}
                </div>
                {product_category?.name ? (
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {product_category.name}
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold tabular-nums">
                {symbol}
                {convert(displayPrice)}{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  {priceSuffix}
                </span>
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Desktop — alquiler: layout horizontal tipo listado
  if (isRental && rent) {
    return (
      <Card
        className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-md h-full transition-all duration-200 hover:shadow-lg cursor-pointer"
        onClick={() => navigateToTour(name, id, country)}
      >
        <div className="flex flex-col md:flex-row md:items-stretch">
          <div
            ref={carouselRef}
            className="relative aspect-[16/10] md:aspect-auto md:w-[min(42%,300px)] md:min-h-[220px] md:shrink-0 overflow-hidden group bg-muted/30"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ perspective: "1000px" }}
          >
            <div className="relative h-full min-h-[180px] md:min-h-[220px] w-full">
              {productImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentImageIndex
                      ? "opacity-100 translate-x-0"
                      : index < currentImageIndex
                        ? "opacity-0 -translate-x-full"
                        : "opacity-0 translate-x-full"
                  }`}
                >
                  <Image
                    src={image || "/tour.jpg"}
                    alt={`${name} - Image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
              {productImages.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/60 dark:bg-black/60 z-10 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/60 dark:bg-black/60 z-10 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {productImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {product_category && (
              <Badge className="absolute top-2 left-2 bg-black/65 text-white z-10 text-xs">
                {product_category.name}
              </Badge>
            )}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
              {Number(average_rating) > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-white/45 dark:bg-black/45 px-2 py-1 text-xs font-medium">
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  {formattedRating}
                </span>
              )}
              <button
                type="button"
                className="bg-white/45 hover:bg-white/65 dark:bg-black/45 dark:hover:bg-black/65 p-1.5 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(id);
                }}
                disabled={isSaving || isUnsaving}
                aria-label={
                  isFavorited
                    ? t("home.tourCard.removeFromFavorites")
                    : t("home.tourCard.addToFavorites")
                }
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorited
                      ? "fill-rose-500 text-rose-500"
                      : "text-gray-700 dark:text-white stroke-[2.5px] hover:text-rose-400"
                  } ${isSaving || isUnsaving ? "opacity-50" : ""}`}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between gap-4 p-4 md:p-5 min-w-0 border-t md:border-t-0 md:border-l border-border/60">
            <div className="space-y-3 min-w-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {product_category?.name}
                </p>
                <h3 className="text-lg md:text-xl font-bold leading-tight text-balance">
                  {vehicleTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {rent.year} · {name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/45 px-2.5 py-1 text-xs font-medium">
                  <Armchair
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  {rent.seating_capacity} {t("home.rental.cardSeats")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/45 px-2.5 py-1 text-xs font-medium">
                  <Cog
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  {transLbl}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/45 px-2.5 py-1 text-xs font-medium">
                  <Droplets
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  {fuelLbl}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
              <div onClick={(e) => e.stopPropagation()}>
                <RentalImportantInfoModal
                  trigger="text"
                  hasDeposit={rent?.has_deposit ?? false}
                  depositAmount={rent?.deposit_amount ?? null}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("home.rentalBooking.pricePerDay")}
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {symbol}
                  {convert(displayPrice)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {priceSuffix}
                  </span>
                </p>
              </div>
              <Button
                variant="default"
                className="rounded-full shrink-0 w-full sm:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToTour(name, id, country);
                }}
              >
                {t("home.tourCard.viewDetails")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Versión desktop — tours
  return (
    <Card className="overflow-hidden rounded-xl border-none shadow-lg h-full transition-all duration-200 hover:shadow-xl">
      <div
        ref={carouselRef}
        className="relative rounded-t-lg overflow-hidden group aspect-[16/10]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: "1000px" }}
      >
        <div className="relative w-full h-full">
          {productImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                index === currentImageIndex
                  ? "opacity-100 translate-x-0"
                  : index < currentImageIndex
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
              }`}
            >
              <Image
                src={image || "/tour.jpg"}
                alt={`${name} - Image ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}

          {productImages.length > 1 && (
            <>
              {/* Botones de navegación */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/60 dark:bg-black/60 z-10 w-8 h-8 sm:w-9 sm:h-9 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/60 dark:bg-black/60 z-10 w-8 h-8 sm:w-9 sm:h-9 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Indicadores de imagen */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {productImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {product_category && (
          <Badge className="absolute top-2 left-2 bg-black/60 text-white hover:bg-black/80 z-10">
            {product_category.name}
          </Badge>
        )}

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          {Number(average_rating) > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/40 dark:bg-black/40 px-2 py-1 text-xs font-medium">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              {formattedRating}
            </span>
          )}
          <button
            className="bg-white/40 hover:bg-white/60 dark:bg-black/40 dark:hover:bg-black/60 p-1.5 rounded-full transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(id);
            }}
            disabled={isSaving || isUnsaving}
            aria-label={
              isFavorited ? "Quitar de favoritos" : "Añadir a favoritos"
            }
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorited
                  ? "fill-rose-500 text-rose-500"
                  : "text-gray-700 dark:text-white stroke-[2.5px] hover:text-rose-400"
              } ${isSaving || isUnsaving ? "opacity-50" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <CardContent className="pt-1">
          <div className="pt-2">
            <h3 className="text-[0.875rem] md:text-[1rem] font-bold text-wrap line-clamp-1">
              {name}
            </h3>
            {product_category?.name ? (
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {product_category.name}
              </p>
            ) : null}
          </div>

          {/* Descripción */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3 mt-1">
            {description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between py-3">
          <div className="font-semibold">
            {symbol}
            {convert(displayPrice)}{" "}
            <span className="text-sm text-muted-foreground font-normal">
              {priceSuffix}
            </span>
          </div>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => navigateToTour(name, id, country)}
          >
            {t("home.tourCard.viewDetails")}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
