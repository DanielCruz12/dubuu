/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface FiltersContentProps {
  filters: any;
  updateFilters: (filters: Partial<any>) => void;
}

export default function FiltersContent({
  filters,
  updateFilters,
}: FiltersContentProps) {
  // Local state to track checkbox selections
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.categories
  );
  const [selectedDurations, setSelectedDurations] = useState<string[]>(
    filters.durations
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(
    filters.priceRange
  );

  // Sync local state with parent filters when they change
  useEffect(() => {
    setSelectedCategories(filters.categories);
    setSelectedDurations(filters.durations);
    setPriceRange(filters.priceRange);
  }, [filters]);

  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    updateFilters({ priceRange: newRange });
  };

  // Handle category checkbox change
  const handleCategoryChange = (category: string, checked: boolean) => {
    let newCategories: string[];

    if (checked) {
      newCategories = [...selectedCategories, category];
    } else {
      newCategories = selectedCategories.filter((c) => c !== category);
    }

    setSelectedCategories(newCategories);
    updateFilters({ categories: newCategories });
  };

  // Handle duration checkbox change
  const handleDurationChange = (duration: string, checked: boolean) => {
    let newDurations: string[];

    if (checked) {
      newDurations = [...selectedDurations, duration];
    } else {
      newDurations = selectedDurations.filter((d) => d !== duration);
    }

    setSelectedDurations(newDurations);
    updateFilters({ durations: newDurations });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Precio</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="my-4"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Categorías</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aventura"
              checked={selectedCategories.includes("aventura")}
              onCheckedChange={(checked) =>
                handleCategoryChange("aventura", checked === true)
              }
            />
            <label
              htmlFor="aventura"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Aventura
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cultural"
              checked={selectedCategories.includes("cultural")}
              onCheckedChange={(checked) =>
                handleCategoryChange("cultural", checked === true)
              }
            />
            <label
              htmlFor="cultural"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Cultural
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="relajacion"
              checked={selectedCategories.includes("relajacion")}
              onCheckedChange={(checked) =>
                handleCategoryChange("relajacion", checked === true)
              }
            />
            <label
              htmlFor="relajacion"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Relajación
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Duración</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="1-dia"
              checked={selectedDurations.includes("1-dia")}
              onCheckedChange={(checked) =>
                handleDurationChange("1-dia", checked === true)
              }
            />
            <label
              htmlFor="1-dia"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              1 día
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="2-3-dias"
              checked={selectedDurations.includes("2-3-dias")}
              onCheckedChange={(checked) =>
                handleDurationChange("2-3-dias", checked === true)
              }
            />
            <label
              htmlFor="2-3-dias"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              2-3 días
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mas-de-3-dias"
              checked={selectedDurations.includes("mas-de-3-dias")}
              onCheckedChange={(checked) =>
                handleDurationChange("mas-de-3-dias", checked === true)
              }
            />
            <label
              htmlFor="mas-de-3-dias"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Más de 3 días
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
