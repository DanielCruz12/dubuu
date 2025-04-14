"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { IProduct } from "@/types/product";
import Rating from "./rating";
import { Badge } from "./ui/badge";
import { isTourProduct } from "@/utils";

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

  const duration = isTourProduct(product) ? product.tour.duration : null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
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
                src={image || "/placeholder.svg"}
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
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 rounded-full bg-white/90 dark:bg-black hover:text-rose-500 transition-colors z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Star className="w-4 h-4" />
        </Button>
      </div>

      <Link href={`/home/tours/${id}`} className="block">
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
              {target_audience?.name} /
            </span>
            {duration && (
              <span className="text-sm text-muted-foreground">
                {duration} {duration > 1 ? "días" : "día"}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="font-semibold">${price}</div>
          <Button className="rounded-full">Reservar</Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
