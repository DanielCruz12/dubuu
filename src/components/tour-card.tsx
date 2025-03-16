"use client";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { IProduct } from "@/types/product";

export function TourCard({
  id,
  name,
  description,
  price,
  max_people,
  duration,
  images,
  average_rating,
  total_reviews,
  product_category,
}: IProduct) {
  const [isHovered, setIsHovered] = useState(false);

  //* Asegurar que `average_rating` sea un número con 2 decimales
  const ratingValue = Number(average_rating) || 0;
  const reviewsCount = total_reviews ?? 0;

  //* Convertir a formato con coma para mostrar (ejemplo: 2,0)
  const formattedRating = ratingValue.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <Link href={`/tours/${id}`}>
      <motion.div
        className="relative aspect-[16/10] rounded-lg cursor-pointer"
        initial={false}
        animate={{ scale: isHovered ? 1.03 : 1, zIndex: isHovered ? 10 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ transformOrigin: "center center" }}
      >
        <Card className="overflow-hidden rounded-3xl border-0 shadow-lg">
          <div className="relative">
            <Image
              src={images.length > 0 ? images[0] : "/placeholder.jpg"}
              alt={name}
              width={400}
              height={300}
              className="w-full h-36 md:h-52 object-cover"
            />
            <button className="absolute right-4 top-4 rounded-full p-1 bg-transparent shadow-sm">
              <Heart className="h-4 w-4 " />
            </button>
            <div className="absolute bottom-[-6px] left-4 flex items-center gap-2 rounded-full px-3 py-1.5 shadow-lg bg-white dark:bg-gray-200">
              <span className="text-muted-foreground dark:text-gray-700 ">
                {product_category?.name}
              </span>
            </div>
          </div>
          <CardContent className="pt-3">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(ratingValue)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="font-normal">{formattedRating}</span>
              <span className="text-muted-foreground text-sm">
                {reviewsCount === 0
                  ? "(No reviews)"
                  : reviewsCount === 1
                    ? "(1 review)"
                    : `(${reviewsCount} reviews)`}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold pt-2 text-wrap line-clamp-1">
              {name}
            </h3>
            <span className="font-normal text-sm md:text-base pt-1 text-muted-foreground text-wrap line-clamp-2">
              {description}
            </span>
            <p className="font-bold">
              {duration} {duration > 1 ? "days" : "day"}
            </p>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div>
              <span className="text-lg md:text-2xl font-bold">${price}</span>
              <span className="text-sm text-muted-foreground">
                / {max_people} people
              </span>
            </div>
            <Button
              className="rounded-full px-5"
              variant={isHovered ? "default" : "secondary"}
            >
              Book Now
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
