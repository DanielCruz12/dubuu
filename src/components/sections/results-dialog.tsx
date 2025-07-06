/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Search, MapPin, Star, X } from "lucide-react";
import type { IProduct } from "@/types/product";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { generateSlug } from "@/lib/utils";

export function ResultDialog({
  isOpen,
  onClose,
  products,
  searchTerm = "",
}: {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  products: IProduct[];
  searchTerm?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Sincronizar el término de búsqueda externo con el interno
  useEffect(() => {
    if (searchTerm) {
      setInputValue(searchTerm);
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm]);

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Guardar una nueva búsqueda en el historial
  const saveSearch = (term: string) => {
    if (term.length < 3) return;

    const newSearches = [
      term,
      ...recentSearches.filter((s) => s !== term),
    ].slice(0, 5);

    setRecentSearches(newSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newSearches));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 2) {
      setLocalSearchTerm(value);
    } else if (value.length === 0) {
      setLocalSearchTerm("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.length > 2) {
      setLocalSearchTerm(inputValue);
      saveSearch(inputValue);
    }
  };

  const handleRecentSearchClick = (term: string) => {
    setInputValue(term);
    setLocalSearchTerm(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSearches = recentSearches.filter((s) => s !== term);
    setRecentSearches(newSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newSearches));
  };

  const navigateToTour = (
    name: string,
    id: string,
    country: string,
    product_type: any,
    product_category: any
  ) => {
    const slug = generateSlug(
      name,
      country,
      product_type.name,
      product_category?.name
    );
    router.push(`/home/${slug}/${id}`);
    onClose(false);
  };

  const filteredProducts = localSearchTerm.length > 2 ? products : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%] p-0 overflow-hidden rounded-xl border-none shadow-xl">
        <div className="bg-gradient-to-r dark:from-black dark:to-primary/5 px-5">
          <DialogHeader>
            <DialogTitle className="text-center pt-6">
              Descubre los tesoros del mundo
            </DialogTitle>
            <DialogDescription className="text-center">
              Explora tus sueños de viaje y hazlos realidad
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="py-2 max-w-md mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                className="pl-10 pr-10 h-10 text-sm rounded-full"
                placeholder="¿Qué estás buscando?"
                value={inputValue}
                onChange={handleSearch}
              />
              {inputValue && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  onClick={() => {
                    setInputValue("");
                    setLocalSearchTerm("");
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Search Results */}
        <div className="h-[60vh] md:h-[50vh] w-full flex flex-col">
          <ScrollArea className="flex-grow w-full p-5">
            {localSearchTerm.length < 3 ? (
              <div className="space-y-6">
                {/* Búsquedas recientes */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">
                        Búsquedas recientes
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={clearRecentSearches}
                      >
                        Limpiar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-full cursor-pointer text-sm"
                          onClick={() => handleRecentSearchClick(term)}
                        >
                          <Search className="w-3 h-3 text-muted-foreground" />
                          {term}
                          <X
                            className="w-3 h-3 ml-1 text-muted-foreground"
                            onClick={(e) => removeRecentSearch(term, e)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sugerencias populares */}
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    Destinos populares
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { image: "/elsalvador.jpg", name: "El Salvador" },
                      { image: "/tour.jpg", name: "Tour en la ciudad" },
                      { image: "/tour2.jpg", name: "Tour en la playa" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="relative h-24 rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => handleRecentSearchClick(item.image)}
                      >
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
                        <Image
                          src={item.image}
                          alt={`Imagen de ${item.name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <span className="text-white font-medium">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 mt-6">
                  <Search className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-center text-muted-foreground text-sm">
                    Escribe al menos 3 caracteres para iniciar la búsqueda
                  </p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 md:h-52 gap-3">
                <Search className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-center text-muted-foreground">
                  No se encontraron resultados para {localSearchTerm}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInputValue("");
                    setLocalSearchTerm("");
                  }}
                >
                  Limpiar búsqueda
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm md:text-base font-medium">
                    {filteredProducts.length} resultado
                    {filteredProducts.length !== 1 ? "s" : ""} para
                    {localSearchTerm}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setInputValue("");
                      setLocalSearchTerm("");
                    }}
                  >
                    Limpiar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((tour) => (
                    <div
                      key={tour.id}
                      className="group p-3 border border-primary/10 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 flex gap-3"
                      onClick={() =>
                        navigateToTour(
                          tour.id,
                          tour.name,
                          tour.country,
                          tour.product_type.name,
                          tour.product_category.name
                        )
                      }
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={tour?.images?.[0] || "/tour1.jpg"}
                          alt={tour.name}
                          fill
                          sizes="(max-width: 440px) 80px, 96px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {tour.product_category && (
                          <Badge className="absolute top-1 left-1 z-20 text-[10px] px-1.5 py-0">
                            {tour.product_category.name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {tour.name}
                        </h3>

                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">
                            {Number(tour.average_rating).toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({tour.total_reviews}{" "}
                            {tour.total_reviews === 1 ? "reseña" : "reseñas"})
                          </span>
                        </div>

                        {tour.country && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{tour.country}</span>
                          </div>
                        )}

                        <div className="mt-1 font-medium text-sm">
                          ${tour.price} USD
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
