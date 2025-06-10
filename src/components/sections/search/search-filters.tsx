/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FilterIcon, Navigation, Star, X, DollarSign } from "lucide-react";
import { productTypes, ratingOptions } from "@/utils/data";
import {
  setRating,
  setCategories,
  setDurations,
  setPriceRange,
  setProductType,
} from "@/redux/slices/product/search/search-slice";

interface SearchFiltersProps {
  activeFiltersCount: number;
  onFilterDialogOpen: () => void;
  isLocationEnabled: boolean;
  country: any;
  isLoadingLocation: boolean;
  onLocationToggle: () => void;
  productType: string;
  rating: string;
  categories: string[];
  durations: string[];
  priceRange: [number, number];
  onResetFilters: () => void;
  dispatch: any;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  activeFiltersCount,
  onFilterDialogOpen,
  isLocationEnabled,
  country,
  isLoadingLocation,
  onLocationToggle,
  productType,
  rating,
  categories,
  durations,
  priceRange,
  onResetFilters,
  dispatch,
}) => {
  return (
    <>
      {/* Filtros rápidos con scroll horizontal */}
      <div className="mb-2">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 pb-1 min-w-max">
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterDialogOpen}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 py-1 h-9 flex-shrink-0"
            >
              <FilterIcon className="h-3.5 w-3.5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Botón de ubicación */}
            <Button
              variant={isLocationEnabled ? "default" : "outline"}
              size="sm"
              onClick={onLocationToggle}
              disabled={isLoadingLocation}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 h-9 flex-shrink-0"
            >
              <Navigation
                className={`h-3.5 w-3.5 ${isLoadingLocation ? "animate-spin" : ""}`}
              />
              <span>
                {isLocationEnabled && country?.name
                  ? country.name
                  : isLoadingLocation
                    ? "Ubicando..."
                    : "Mi ubicación"}
              </span>
            </Button>

            {/* Product types */}
            {productTypes.map(({ name, id, description }) => (
              <Button
                key={id}
                variant={productType === name ? "default" : "outline"}
                size="sm"
                onClick={() => dispatch(setProductType(name))}
                className="rounded-full whitespace-nowrap px-3 py-1 h-9 flex-shrink-0"
              >
                {description}
              </Button>
            ))}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {rating !== "0" && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 gap-1.5 flex items-center"
            >
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {ratingOptions.find((opt) => opt.value === rating)?.label ||
                rating}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => dispatch(setRating("0"))}
              />
            </Badge>
          )}

          {isLocationEnabled && country && country.code && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 gap-1.5 flex items-center"
            >
              <Navigation className="h-3 w-3 text-blue-600" />
              {country.name || country.code}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={onLocationToggle}
              />
            </Badge>
          )}

          {categories.length > 0 && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 gap-1.5 flex items-center"
            >
              Categorías: {categories.length}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => dispatch(setCategories([]))}
              />
            </Badge>
          )}

          {durations.length > 0 && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 gap-1.5 flex items-center"
            >
              Duración: {durations.length}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => dispatch(setDurations([]))}
              />
            </Badge>
          )}

          {(priceRange[0] > 0 || priceRange[1] < 1000) && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 gap-1.5 flex items-center"
            >
              <DollarSign className="h-3 w-3 text-green-600" />${priceRange[0]}{" "}
              - ${priceRange[1]}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => dispatch(setPriceRange([0, 1000]))}
              />
            </Badge>
          )}

          {activeFiltersCount > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-xs h-7 px-2 rounded-full"
            >
              Limpiar todos
            </Button>
          )}
        </div>
      )}
    </>
  );
};
