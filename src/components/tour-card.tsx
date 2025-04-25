"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { IProduct } from "@/types/product";
import Rating from "./rating";
import { Badge } from "./ui/badge";
import { normalizeCountryForUrl } from "@/utils";
import { useRouter } from "next/navigation";

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

  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((item) => item !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const navigateToTour = (tourId: string, tourCountry: string) => {
    // Normalize the country name for the URL
    const normalizedCountry = normalizeCountryForUrl(tourCountry);
    router.push(`/home/tours/${normalizedCountry}/${tourId}`);
  };

  return (
    <Card className="overflow-hidden rounded-xl border-none shadow-lg">
      <div
        className="relative aspect-[16/10] rounded-t-lg overflow-hidden"
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
                src={image || "/tour.jpg"}
                alt={`${name} - Image ${index + 1}`}
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
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <Badge className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/80 z-10">
          {product_category.name}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 rounded-full h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(id);
          }}
        >
          <Heart
            className={`h-4 w-4 ${favorites.includes(id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </Button>
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
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {country} /
            </div>
            <span className="text-sm text-muted-foreground">
              {target_audience?.name}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="font-semibold">${price}</div>
          <Button
            className="rounded-full"
            onClick={() => navigateToTour(id, country)}
          >
            Ver detalles
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
