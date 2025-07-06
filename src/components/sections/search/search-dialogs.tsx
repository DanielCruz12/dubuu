/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Star, MapPin, RefreshCw } from "lucide-react";
import Image from "next/image";
import type { IProduct } from "@/types/product";
import { productTypes, ratingOptions } from "@/utils/data";
import { setSearchTerm } from "@/redux/slices/product/search/search-slice";
import { PriceRangeHistogram } from "@/components/price-range-histogram";
import { generateSlug } from "@/lib/utils";

interface SearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredProducts: IProduct[];
  dispatch: any;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onOpenChange,
  searchTerm,
  onSearchChange,
  filteredProducts,
  dispatch,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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

          <div className="py-2 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                className="pl-10 pr-10 h-10 text-sm rounded-full"
                placeholder="¿Qué estás buscando?"
                value={searchTerm}
                onChange={onSearchChange}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  onClick={() => dispatch(setSearchTerm(""))}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-[60vh] md:h-[50vh] w-full flex flex-col">
          <ScrollArea className="flex-grow w-full p-5">
            {searchTerm.length < 3 ? (
              <div className="flex flex-col items-center justify-center gap-3 mt-6">
                <Search className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-center text-muted-foreground text-sm">
                  Escribe al menos 3 caracteres para iniciar la búsqueda
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 md:h-52 gap-3">
                <Search className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-center text-muted-foreground">
                  No se encontraron resultados para {searchTerm}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setSearchTerm(""))}
                >
                  Limpiar búsqueda
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm md:text-base font-medium">
                    {filteredProducts.length} resultado
                    {filteredProducts.length !== 1 ? "s" : ""} para {searchTerm}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => dispatch(setSearchTerm(""))}
                  >
                    Limpiar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((tour, index) => {
                    const tourId = tour?.id || `tour-${index}`;
                    const tourName = tour?.name || "Sin nombre";
                    const tourPrice = tour?.price || 0;
                    const tourRating = Number(tour?.average_rating) || 0;
                    const tourReviews = tour?.total_reviews || 0;
                    const tourImages = tour?.images || [];
                    const tourCategory = tour?.product_category;

                    return (
                      <div
                        key={tourId}
                        onClick={() => {
                          const slug = generateSlug(
                            tourName,
                            tour?.country,
                            tour?.product_type?.name,
                            tour?.product_category?.name
                          );
                          window.open(`/home/${slug}/${tourId}`, "_blank");
                        }}
                        className="group p-3 border border-primary/10 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 flex gap-3"
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={tourImages[0] || "/elsalvador.jpg"}
                            width={100}
                            height={100}
                            alt={tourName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {tourCategory && (
                            <Badge className="absolute top-1 left-1 z-20 text-[10px] px-1.5 py-0">
                              {tourCategory.name || "Categoría"}
                            </Badge>
                          )}
                        </div>

                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {tourName}
                          </h3>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {tour.description || "Descripción no disponible"}
                          </div>

                          {tour?.address && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{tour?.address}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">
                              {tourRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({tourReviews}{" "}
                              {tourReviews === 1 ? "reseña" : "reseñas"})
                            </span>
                          </div>

                          <div className="mt-1 font-medium text-sm">
                            ${tourPrice} p/p
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tempProductType: string;
  setTempProductType: (value: string) => void;
  tempRating: string;
  setTempRating: (value: string) => void;
  tempPriceRange: [number, number];
  setTempPriceRange: (value: [number, number]) => void;
  tempCategories: string[];
  tempDurations: string[];
  onCategoryChange: (category: string, checked: boolean) => void;
  onDurationChange: (duration: string, checked: boolean) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onOpenChange,
  tempProductType,
  setTempProductType,
  tempRating,
  setTempRating,
  tempPriceRange,
  setTempPriceRange,
  tempCategories,
  tempDurations,
  onCategoryChange,
  onDurationChange,
  onApplyFilters,
  onResetFilters,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[55%] p-0 overflow-hidden rounded-xl border-none shadow-xl">
        <div className="bg-gradient-to-r dark:from-black dark:to-primary/5 border-none px-4 md:px-0">
          <DialogHeader>
            <DialogTitle className="text-center pt-6">
              Filtrar resultados
            </DialogTitle>
            <DialogDescription className="pt-1 pb-2 text-center">
              Ajusta los filtros para encontrar productos según tus
              preferencias.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-3 py-3 mx-auto max-w-3xl">
            {/* Tipo de producto */}
            <div>
              <label className="text-xs font-medium mb-1 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                Tipo de producto
              </label>
              <Select
                value={tempProductType}
                onValueChange={setTempProductType}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tipo de producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    Todos los tipos
                  </SelectItem>
                  {productTypes.map(({ name, description }) => (
                    <SelectItem key={name} value={name} className="text-xs">
                      {description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calificación */}
            <div>
              <label className="text-xs font-medium mb-1 inline-flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400" />
                Calificación
              </label>
              <Select value={tempRating} onValueChange={setTempRating}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Calificación" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map(({ label, value }) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Precio con slider */}
            <div className="pt-1 px-2 md:col-span-2">
              <PriceRangeHistogram
                value={tempPriceRange}
                onValueChange={setTempPriceRange}
                min={0}
                max={1000}
                step={10}
              />
            </div>

            {/* Categorías */}
            <div>
              <label className="text-xs font-medium mb-2 block">
                Categorías
              </label>
              <div className="space-y-2">
                {["aventura", "cultural", "relajacion"].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={tempCategories.includes(category)}
                      onCheckedChange={(checked) =>
                        onCategoryChange(category, checked === true)
                      }
                    />
                    <label
                      htmlFor={category}
                      className="text-xs font-medium leading-none"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Duración */}
            <div>
              <label className="text-xs font-medium mb-2 block">Duración</label>
              <div className="space-y-2">
                {["1-dia", "2-3-dias", "mas-de-3-dias"].map((duration) => (
                  <div key={duration} className="flex items-center space-x-2">
                    <Checkbox
                      id={duration}
                      checked={tempDurations.includes(duration)}
                      onCheckedChange={(checked) =>
                        onDurationChange(duration, checked === true)
                      }
                    />
                    <label
                      htmlFor={duration}
                      className="text-xs font-medium leading-none"
                    >
                      {duration === "1-dia"
                        ? "1 día"
                        : duration === "2-3-dias"
                          ? "2-3 días"
                          : "Más de 3 días"}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between py-4 gap-3 max-w-3xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9 text-sm px-4 flex items-center gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Restablecer
            </Button>
            <Button
              size="sm"
              className="h-9 text-sm px-4 flex items-center gap-2"
              onClick={onApplyFilters}
            >
              Aplicar filtros
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
