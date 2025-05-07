/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import type React from "react";
import { useState, useRef, useEffect, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { IProduct } from "@/types/product";
import Rating from "./rating";
import { Badge } from "./ui/badge";
import { normalizeCountryForUrl } from "@/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  useSaveProductMutation,
  useUnsaveProductMutation,
  useGetUserFavoritesQuery,
} from "@/redux/slices/favorite/favorite-slice";
import { toast } from "sonner";
import { calculatePriceWithTaxes } from "@/lib/price";

export function TourCard(product: IProduct) {
  const {
    id,
    name,
    description,
    price,
    country,
    target_audience,
    images,
    average_rating,
    total_reviews,
    product_category,
  } = product;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useUser();

  // Get favorites from API
  const { data: favorites } = useGetUserFavoritesQuery(
    { userId: user?.id || "" },
    { skip: !user?.id }
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
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
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
        prev === images.length - 1 ? 0 : prev + 1
      );
    }

    if (isRightSwipe && images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }

    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };

  const toggleFavorite = async (productId: string) => {
    if (!user?.id) {
      toast.error("Debes iniciar sesión para guardar productos");
      return;
    }

    try {
      if (isFavorited) {
        await unsaveProduct({
          productId,
          userId: user.id,
        }).unwrap();
        toast.success("Producto eliminado de tus guardados");
      } else {
        await saveProduct({
          productId,
          userId: user.id,
        }).unwrap();
        toast.success("Producto guardado exitosamente");
      }
    } catch (error) {
      toast.error("Ocurrió un error al actualizar tus guardados");
      console.error("Error toggling favorite:", error);
    }
  };

  const navigateToTour = (tourId: string, tourCountry: string) => {
    // Normalize the country name for the URL
    const normalizedCountry = normalizeCountryForUrl(tourCountry);
    router.push(`/home/tours/${normalizedCountry}/${tourId}`);
  };

  // Safely handle images array
  const productImages = images && images.length > 0 ? images : ["/tour.jpg"];

  return (
    <Card className="overflow-hidden rounded-xl border-none shadow-lg">
      <div
        ref={carouselRef}
        className="relative aspect-[16/10] rounded-t-lg overflow-hidden group"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full">
          {productImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ${
                index === currentImageIndex
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={image || "/tour.jpg"}
                alt={`${name} - Image ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}

          {productImages.length > 1 && (
            <>
              {!isMobile && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[#ffffff6b] dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#ffffff6b] dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </>
              )}
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
          <Badge className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/80 z-10">
            {product_category.name}
          </Badge>
        )}

        <button
          className="absolute top-2 right-2 bg-[#ffffff39] z-10 p-2 rounded-full transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(id);
          }}
          disabled={isSaving || isUnsaving}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorited
                ? "fill-rose-500 text-rose-500"
                : "text-white stroke-[2.5px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] hover:text-rose-400"
            } ${isSaving || isUnsaving ? "opacity-50" : ""}`}
          />
        </button>
      </div>

      <div className="block">
        <CardContent className="pt-3">
          <Rating
            averageRating={average_rating}
            reviewsCount={total_reviews}
            maxStars={5}
            activeStarClassName="text-yellow-400 fill-yellow-400"
            inactiveStarClassName="text-gray-300"
          />
          <h3 className="text-base md:text-lg font-bold pt-2 text-wrap line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {description}
          </p>
          <div className="flex flex-wrap justify-start gap-3 mt-2">
            {country && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {country} {target_audience && "/"}
              </div>
            )}
            {target_audience && (
              <span className="text-sm text-muted-foreground">
                {target_audience.name}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="font-semibold">${calculatePriceWithTaxes(price)}</div>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => navigateToTour(id, country || "")}
          >
            Ver detalles
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
