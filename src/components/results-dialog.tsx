"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Star } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { useState } from "react";
import { IProduct } from "@/types/product";

export function ResultDialog({
  isOpen,
  onClose,
  products,
}: {
  isOpen: boolean;
  products: IProduct[];
  onClose: (isOpen: boolean) => void;
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
      <DialogContent className="sm:max-w-[425px] max-w-[90%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[55%] mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Discover the World’s Treasures</DialogTitle>
          <DialogDescription>
            Explore your travel dreams and make them a reality
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="py-2">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none"
                value={inputValue}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="h-44 w-full flex flex-col">
          <ScrollArea className="flex-grow w-full rounded-md">
            {searchTerm.length < 3 ? (
              <div className="flex items-center justify-center h-44">
                <p className="text-center text-muted-foreground">
                  Start searching
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-44">
                <p className="text-center text-muted-foreground">
                  No tours found
                </p>
              </div>
            ) : (
              // Show results if found
              filteredProducts.map((tour, index) => {
                const ratingValue = Number(tour.average_rating) || 0;
                const reviewsCount = tour.total_reviews ?? 0;

                const formattedRating = ratingValue.toLocaleString("es-ES", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                });

                return (
                  <div
                    key={index}
                    className="mb-4 py-2 border-b cursor-pointer rounded-md flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg">{tour.name}</h3>
                      <div className="flex items-center mt-1 gap-2">
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
                      <p className="text-xl font-bold text-primary mt-1">
                        ${tour.price}
                      </p>

                      <p className="text-sm mt-2 line-clamp-2">
                        {tour.description}
                      </p>
                    </div>
                    <div className="w-full sm:w-24 h-24 relative rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={tour?.banner || "/placeholder.jpg"}
                        alt={tour.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="image"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
