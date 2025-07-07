/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import type React from "react";
import { useState, useRef, useEffect, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Heart, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { IProduct } from "@/types/product";
import Rating from "./rating";
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
import { useCurrency } from "@/hooks/use-currency-converter";

export function TourCard(props: IProduct & { isMobileOptimized?: boolean }) {
  const {
    id,
    name,
    description,
    price,
    country,
    images,
    average_rating,
    total_reviews,
    address,
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
  const { convert, symbol } = useCurrency();

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

  const navigateToTour = (name: string, id: string, country: string) => {
    const slug = generateSlug(
      name,
      country,
      product_type.name,
      product_category?.name
    );
    router.push(`/home/${slug}/${id}`);
  };

  // Safely handle images array
  const productImages = images && images.length > 0 ? images : ["/tour.jpg"];

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
          className="relative rounded-t-lg overflow-hidden aspect-square"
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

          {/* Botón de favorito */}
          <button
            className="absolute top-2 right-2 bg-white/40 hover:bg-white/60 dark:bg-black/40 dark:hover:bg-black/60 z-10 p-1.5 rounded-full transition-colors duration-200"
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

        <div className="p-2">
          {/* Título y ubicación */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-start justify-between">
              <div className="text-xs  line-clamp-1">{name}</div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span>{formattedRating}</span>
              </div>
            </div>
            <span className="text-xs line-clamp-1 text-muted-foreground">
              {country}, {address}
            </span>

            {/* Precio */}
            <div className="text-xs">
              <span className="font-semibold">
                {symbol}
                {convert(price)}{" "}
              </span>{" "}
              p/p
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Versión desktop (completa con todas las características)
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

        <button
          className="absolute top-2 right-2 bg-white/40 hover:bg-white/60 dark:bg-black/40 dark:hover:bg-black/60 z-10 p-1.5 rounded-full transition-colors duration-200"
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

      <div className="flex flex-col">
        <CardContent className="pt-1">
          <div className="flex items-center justify-between">
            {/* Título */}
            <h3 className="text-[0.875rem]  pt-2 md:text-[1rem] font-bold text-wrap line-clamp-1 ">
              {name}
            </h3>
            {/* Rating */}
            {total_reviews > 0 && (
              <Rating
                averageRating={average_rating}
                reviewsCount={total_reviews}
                maxStars={total_reviews > 0 ? 5 : 1}
                activeStarClassName="text-yellow-400 fill-yellow-400"
                inactiveStarClassName="text-gray-300"
              />
            )}
          </div>

          {/* Descripción */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>

          {/* Ubicación y audiencia */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 ">
            {country && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {address}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between py-3">
          <div className="font-semibold">
            {symbol}
            {convert(price)}{" "}
            <span className="text-sm text-muted-foreground">p/p</span>
          </div>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => navigateToTour(name, id, country)}
          >
            Ver detalles
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
