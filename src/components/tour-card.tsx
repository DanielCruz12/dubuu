/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
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
        className="relative aspect-[16/10] rounded-t-lg overflow-hidden group"
        onClick={(e) => e.stopPropagation()}
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
                className="object-cover"
              />
            </div>
          ))}

          {productImages.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
          <Badge className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/80 z-10">
            {product_category.name}
          </Badge>
        )}

        <button
          className="absolute top-2 right-2 z-10 p-2 rounded-full transition-colors duration-200"
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
                : "text-white stroke-[2.5px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] hover:text-rose-100"
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
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
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
          <div className="font-semibold">${price}</div>
          <Button
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
