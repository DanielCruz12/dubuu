"use client";

import { useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import {
  resetFilters,
  setRating,
  setPricing,
  setCategory,
} from "@/redux/slices/filter/filter-slice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  FilterIcon,
  Layout,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";

import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ResultDialog } from "./results-dialog";
import { IProduct } from "@/types/product";
import { categoryOptions, ratingOptions } from "@/utils/data";

export default function SearchSection({ products }: { products: IProduct[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { rating, pricing, category } = useAppSelector(
    (state: RootState) => state.filters
  );

  return (
    <div className="w-full rounded-md shadow-sm">
      <ResultDialog
        products={products}
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
      />

      <div className="flex items-center justify-start space-x-2 ">
        <FilterIcon className="h-4 w-4" />
        <span className="text-sm font-medium pr-4">Filtros</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(resetFilters())}
          className="h-8 text-sm px-3 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Restablecer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2">
        <div>
          <label className="text-xs font-medium mb-1 inline-flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400" />
            Calificación
          </label>
          <Select
            value={rating}
            onValueChange={(value) => dispatch(setRating(value))}
          >
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

        <div className="col-span-1 md:col-span-1 pt-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium">
              <DollarSign className="h-3 w-3 text-green-800" /> Precio máx.
            </label>
            <Badge variant="outline" className="font-medium text-xs h-5 px-2">
              ${pricing}
            </Badge>
          </div>
          <Slider
            min={0}
            max={1000}
            step={50}
            value={[pricing]}
            onValueChange={(value) => dispatch(setPricing(value[0]))}
            className="py-0"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>$0</span>
            <span>$1000</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 inline-flex items-center gap-1">
            <Layout className="h-3 w-3" />
            Categoría
          </label>
          <Select
            value={category}
            onValueChange={(value) => dispatch(setCategory(value))}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(({ label, value }) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          className="pl-8 h-10 text-xs"
          onFocus={() => setIsDialogOpen(true)}
        />
      </div>
    </div>
  );
}
