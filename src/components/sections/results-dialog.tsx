"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Star } from "lucide-react";
import { IProduct } from "@/types/product";
import { Input } from "../ui/input";

// Define the product type for better type safety
export interface Product {
  id: number;
  name: string;
  average_rating: number;
  total_reviews: number;
  price: number;
  description: string;
  banner: string;
  location?: string;
  duration?: string;
}

export function ResultDialog({
  isOpen,
  onClose,
  products,
}: {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  products: IProduct[];
}) {
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setInputValue(value);

    if (value.length > 2) {
      setSearchTerm(value);
    } else {
      setSearchTerm("");
    }
  };

  const filteredProducts =
    searchTerm.length > 2
      ? products.filter((tour) =>
          tour.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%] p-0 overflow-hidden rounded-xl border-none shadow-xl">
        <div className="bg-gradient-to-r dark:from-black dark:to-primary/5  px-5">
          <DialogHeader className="">
            <DialogTitle className="text-center pt-6">
              Discover the Worlds Treasures
            </DialogTitle>
            <DialogDescription className="text-center">
              Explore your travel dreams and make them a reality
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="py-2 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                className="pl-8 h-8 text-xs"
                placeholder="What are you looking for?"
                value={inputValue}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] w-full flex flex-col ">
          <ScrollArea className="flex-grow w-full p-5">
            {searchTerm.length < 3 ? (
              <div className="flex flex-col items-center justify-center h-60 gap-3">
                <Search className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-center text-muted-foreground">
                  Type at least 3 characters to start searching
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 gap-3">
                <Search className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-center text-muted-foreground">
                  No tours found matching {searchTerm}
                </p>
              </div>
            ) : (
              <div className="md:space-y-4">
                <h3 className="text-sm md:text-lg font-medium">
                  {filteredProducts.length} result
                  {filteredProducts.length !== 1 ? "s" : ""} found
                </h3>
                {filteredProducts.map((tour) => {
                  const ratingValue = Number(tour.average_rating) || 0;
                  const reviewsCount = tour.total_reviews ?? 0;

                  const formattedRating = ratingValue.toLocaleString("en-US", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  });

                  return (
                    <div
                      key={tour.id}
                      className="group p-5 md:p-6 border border-primary/10 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 flex flex-col sm:flex-row gap-5"
                    >
                      <div className="w-full sm:w-28 h-14 md:h-36 relative rounded-lg overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t dark:from-black/60 dark:to-transparent z-10" />
                        <Badge className="absolute bottom-2 right-2 z-20 bg-primary/90">
                          ${tour.price}
                        </Badge>
                        <Image
                          src={
                            tour?.banner ||
                            "/placeholder.svg?height=400&width=600"
                          }
                          alt={tour.name}
                          fill
                          sizes="(max-width: 440px) 100vw, 144px"
                          priority
                          style={{ objectFit: "cover" }}
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-bold text-sm md:text-xl group-hover:text-primary transition-colors">
                          {tour.name}
                        </h3>

                        <div className="flex items-center mt-2 gap-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(ratingValue)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="font-medium ml-1">
                            {formattedRating}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {reviewsCount === 0
                              ? "(No reviews)"
                              : reviewsCount !== 1
                                ? `(${reviewsCount} reviews)`
                                : "(1 review)"}
                          </span>
                        </div>

                        {/*  <div className="flex flex-wrap gap-3 mt-2">
                          {tour.departure_point && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              {tour.departure_point}
                            </div>
                          )}
                        </div> */}

                        <p className="text-sm mt-3 line-clamp-2 text-muted-foreground">
                          {tour.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
