/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Navigation, Star, X, DollarSign } from "lucide-react";
import {
  productTypesTranslations,
  ratingOptionsTranslations,
} from "@/utils/data";
import {
  setRating,
  setPriceRange,
} from "@/redux/slices/product/search/search-slice";
import { useLanguage } from "@/lib/i18n-context";

interface SearchFiltersProps {
  activeFiltersCount: number;
  productType: string;
  rating: string;
  priceRange: [number, number];
  onResetFilters: () => void;
  dispatch: any;
  isLocationEnabled: boolean;
  country: { code?: string; name?: string } | null;
  onLocationToggle: () => void;
  onProductTypeSelect: (name: string) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  activeFiltersCount,
  productType,
  rating,
  priceRange,
  onResetFilters,
  dispatch,
  isLocationEnabled,
  country,
  onLocationToggle,
  onProductTypeSelect,
}) => {
  const { t, language } = useLanguage();
  const productTypes = productTypesTranslations[language];
  const ratingOptions = ratingOptionsTranslations[language];
  return (
    <>
      {/* Filtros rápidos con scroll horizontal */}
      <div className="mb-2">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 pb-1 min-w-max">
            {/* Product types */}
            {productTypes.map(({ name, id, description }) => (
              <Button
                key={id}
                variant={productType === name ? "default" : "outline"}
                size="sm"
                onClick={() => onProductTypeSelect(name)}
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
              {t("common.clearAll")}
            </Button>
          )}
        </div>
      )}
    </>
  );
};
