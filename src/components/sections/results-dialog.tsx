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
import { Search } from "lucide-react";
import type { IProduct } from "@/types/product";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { normalizeCountryForUrl } from "@/utils";
import Rating from "../rating";

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
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setInputValue(value);

    if (value.length > 2) {
      setSearchTerm(value);
    } else {
      setSearchTerm("");
    }
  };

  const navigateToTour = (tourId: string, tourCountry: string) => {
    // Normalize the country name for the URL
    const normalizedCountry = normalizeCountryForUrl(tourCountry);
    router.push(`/home/${normalizedCountry}/tours/${tourId}`);
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
          <DialogHeader>
            <DialogTitle className="text-center pt-6">
              Descubra los tesoros del mundo
            </DialogTitle>
            <DialogDescription className="text-center">
              Explora tus sueños de viaje y hazlos realidad
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="py-2 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                className="pl-8 h-8 text-xs"
                placeholder="¿Qué estás buscando?"
                value={inputValue}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="h-[60vh] md:h-[35vh] w-full flex flex-col ">
          <ScrollArea className="flex-grow w-full p-5">
            {searchTerm.length < 3 ? (
              <div className="flex flex-col items-center justify-center h-80 md:h-52 gap-3">
                <Search className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-center text-muted-foreground">
                  Escriba al menos 3 caracteres para iniciar la búsqueda
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 md:h-52 gap-3">
                <Search className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-center text-muted-foreground">
                  No se encontraron resultados que coincidan {searchTerm}
                </p>
              </div>
            ) : (
              <div className="md:space-y-4 ">
                <h3 className="text-sm md:text-lg px-4 font-medium">
                  {filteredProducts.length} resultado
                  {filteredProducts.length !== 1 ? "s" : ""} encontrado
                </h3>
                {filteredProducts.map((tour) => {
                  return (
                    <div
                      key={tour.id}
                      className="group p-4 md:p-6 border border-primary/10 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 flex flex-col sm:flex-row gap-5"
                      onClick={() => navigateToTour(tour.id, tour.country)}
                    >
                      <div className="w-full sm:w-28 h-36 md:h-28 relative rounded-lg overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t dark:from-black/60 dark:to-transparent z-10" />
                        <Badge className="absolute bottom-2 right-2 z-20 bg-primary/90">
                          ${tour.price}
                        </Badge>
                        <Image
                          src={
                            tour?.banner ||
                            "/logo.png?height=400&width=600"
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

                        <Rating
                          averageRating={tour.average_rating}
                          reviewsCount={tour.total_reviews}
                          maxStars={5}
                          activeStarClassName="text-yellow-400 fill-yellow-400"
                          inactiveStarClassName="text-gray-300"
                        />

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
