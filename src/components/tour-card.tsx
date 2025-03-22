"use client";
import Image from "next/image";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { IProduct } from "@/types/product";
import Rating from "./rating";

export function TourCard({
  id,
  name,
  description,
  price,
  max_people,
  duration,
  banner,
  average_rating,
  total_reviews,
  product_category,
}: IProduct) {
  const [isHovered, setIsHovered] = useState(false);

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
              src={banner || "/placeholder.svg?height=400&width=600"}
              alt={name}
              width={400}
              height={300}
              className="w-full h-36 md:h-44 object-cover"
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
            <span className=" md:text-sm pt-1 text-muted-foreground text-wrap line-clamp-2">
              {description}
            </span>
           {/*  <div className="flex flex-wrap gap-3 mt-2">
              {tour.departure_point && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {tour.departure_point}
                </div>
              )}
            </div> */}
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
