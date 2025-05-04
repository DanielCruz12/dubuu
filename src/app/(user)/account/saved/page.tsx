/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser } from "@clerk/nextjs";
import { DashboardTitle } from "@/components/dashboard-title";

import { Loader2, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Rating from "@/components/rating";
import { useRouter } from "next/navigation";
import { normalizeCountryForUrl } from "@/utils";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import {
  useGetUserFavoritesQuery,
  useSaveProductMutation,
  useUnsaveProductMutation,
} from "@/redux/slices/favorite/favorite-slice";

const SavedProductCard = ({
  productId,
  isFavorited,
  onToggleFavorite,
}: {
  productId: string;
  isFavorited: boolean;
  onToggleFavorite: (productId: string) => void;
}) => {
  const { data: product, isLoading, error } = useGetProductQuery(productId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const navigateToProduct = (productId: string, country?: string) => {
    if (country) {
      const normalizedCountry = normalizeCountryForUrl(country);
      router.push(`/home/tours/${normalizedCountry}/${productId}`);
    } else {
      router.push(`/products/${productId}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-xl border-none shadow-lg">
        <div className="aspect-[16/10] rounded-t-lg bg-gray-200 animate-pulse"></div>
        <CardContent className="pt-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded-full animate-pulse w-1/3"></div>
        </CardFooter>
      </Card>
    );
  }

  if (error || !product) {
    return (
      <Card className="overflow-hidden rounded-xl border-none shadow-lg">
        <div className="aspect-[16/10] rounded-t-lg bg-gray-100 flex items-center justify-center">
          <p className="text-sm text-gray-500">Error loading product</p>
        </div>
        <CardContent className="pt-3">
          <p className="text-red-500">Failed to load product details</p>
        </CardContent>
      </Card>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["/placeholder.svg?height=300&width=500&query=product"];

  return (
    <Card className="overflow-hidden rounded-xl border-none shadow-lg">
      <div
        className="relative aspect-[16/10] rounded-t-lg overflow-hidden group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ${
                index === currentImageIndex
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={
                  image || "/placeholder.svg?height=300&width=500&query=product"
                }
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}

          {images.length > 1 && (
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
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {product.product_category && (
          <Badge className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/80 z-10">
            {product.product_category.name}
          </Badge>
        )}

        <button
          className="absolute top-2 right-2 z-10 p-2 rounded-full transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorited
                ? "fill-rose-500 text-rose-500"
                : "text-white stroke-[2.5px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] hover:text-rose-100"
            }`}
          />
        </button>
      </div>

      <div className="block">
        <CardContent className="pt-3">
          {product.average_rating !== undefined && (
            <Rating
              averageRating={product.average_rating}
              reviewsCount={product.total_reviews || 0}
              maxStars={5}
              activeStarClassName="text-yellow-400 fill-yellow-400"
              inactiveStarClassName="text-gray-300"
            />
          )}
          <h3 className="text-base md:text-lg font-bold pt-2 text-wrap line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {product.description}
          </p>
          <div className="flex flex-wrap justify-start gap-3 mt-2">
            {product.country && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {product.country}
                {product.target_audience && "/"}
              </div>
            )}
            {product.target_audience && (
              <span className="text-sm text-muted-foreground">
                {product.target_audience.name}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="font-semibold">${product.price}</div>
          <Button
            className="rounded-full"
            onClick={() => navigateToProduct(product.id, product.country)}
          >
            Ver detalles
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

const Saved = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const {
    data: favorites,
    isLoading,
    error,
  } = useGetUserFavoritesQuery(
    { userId: user?.id || "" },
    { skip: !isSignedIn || !user?.id }
  );
  const [unsaveProduct] = useUnsaveProductMutation();
  const [saveProduct] = useSaveProductMutation();

  const handleToggleFavorite = async (productId: string) => {
    if (!isSignedIn || !user?.id) return;

    // Check if product is already in favorites
    const isFavorited = favorites?.some(
      (fav: any) => fav.productId === productId
    );

    try {
      if (isFavorited) {
        await unsaveProduct({
          productId,
          userId: "user_2wbRK6BohzvHH9YZqL0ZlkDvmp5",
        });
      } else {
        await saveProduct({
          productId,
          userId: "user_2wbRK6BohzvHH9YZqL0ZlkDvmp5",
        });
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Wait for Clerk to load user data
  if (!isLoaded) {
    return (
      <div className="px-3 md:px-0">
        <DashboardTitle
          heading="Guardados"
          description="Vuelve a ver los productos que guardaste anteriormente"
        />
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="px-3 md:px-0">
        <DashboardTitle
          heading="Guardados"
          description="Vuelve a ver los productos que guardaste anteriormente"
        />
        <div className="mt-8 text-center">
          <p>Inicia sesión para ver tus productos guardados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Guardados"
        description="Vuelve a ver los productos que guardaste anteriormente"
      />

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="mt-8 text-center">
          <p className="text-red-500">
            Error al cargar tus productos guardados
          </p>
        </div>
      )}

      {favorites && favorites.length === 0 && (
        <div className="mt-8 text-center">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-300" />
          </div>
          <p className="mt-4 text-gray-500">No tienes productos guardados</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            Explorar productos
          </Link>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
          {favorites.map((favorite: any) => (
            <SavedProductCard
              key={favorite.id}
              productId={favorite.productId}
              isFavorited={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
