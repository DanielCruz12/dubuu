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
import { DollarSign, FilterIcon, RefreshCw, Search, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ResultDialog } from "./results-dialog";
import { IProduct } from "@/types/product";
import { categoryOptions, ratingOptions } from "@/utils/data";

export default function SearchSection({ products }: { products: IProduct[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { rating, pricing, category } = useAppSelector(
    (state: RootState) => state.filters
  );

  // Estados locales para aplicar los filtros al final
  const [tempRating, setTempRating] = useState(rating);
  const [tempPricing, setTempPricing] = useState(pricing);

  const handleApplyFilters = () => {
    dispatch(setRating(tempRating));
    dispatch(setPricing(tempPricing));
    setIsDialogFilterOpen(false);
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setTempRating(rating);
    setTempPricing(pricing);
    setIsDialogFilterOpen(false);
  };

  return (
    <div className="w-full rounded-md shadow-sm">
      <ResultDialog
        products={products}
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categoryOptions.map(({ label, value }) => (
          <Button
            key={value}
            variant={category === value ? "default" : "ghost"}
            onClick={() => dispatch(setCategory(value))}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-start space-x-2">
        <Button variant="outline" onClick={() => setIsDialogFilterOpen(true)}>
          <FilterIcon className="h-4 w-4" />
          <span className="text-sm font-medium pr-4">Filtros</span>
        </Button>

        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-8 h-10 text-xs"
            onFocus={() => setIsDialogOpen(true)}
          />
        </div>

        <Dialog open={isDialogFilterOpen} onOpenChange={setIsDialogFilterOpen}>
          <DialogContent className="sm:max-w-[425px] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[55%] p-0 overflow-hidden rounded-xl border-none shadow-xl">
            <div className="bg-gradient-to-r dark:from-black dark:to-primary/5 border-none px-4 md:px-0">
              <DialogHeader>
                <DialogTitle className="text-center pt-6">Filtrar resultados</DialogTitle>
                <DialogDescription className="pt-1 pb-2 text-center">
                  Ajusta los filtros para encontrar productos según tus
                  preferencias.
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 grid-cols-1 gap-3 py-3 mx-auto max-w-3xl">
                <div>
                  <label className="text-xs font-medium mb-1 inline-flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400" />
                    Calificación
                  </label>
                  <Select
                    value={tempRating}
                    onValueChange={(value) => setTempRating(value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratingOptions.map(({ label, value }) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="text-xs"
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-1 px-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium inline-flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-800" />
                      Precio máx.
                    </label>
                    <Badge
                      variant="outline"
                      className="font-medium text-xs h-5 px-2"
                    >
                      ${tempPricing}
                    </Badge>
                  </div>
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={[tempPricing]}
                    onValueChange={(value) => setTempPricing(value[0])}
                    className="py-0"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$1000</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between py-4 gap-3 max-w-3xl mx-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 text-sm p-4 px-3 flex items-center gap-2"
                >
                  <RefreshCw className="h-6 w-4" />
                  Restablecer
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-sm px-3 flex items-center gap-2"
                  onClick={handleApplyFilters}
                >
                  Aplicar filtros
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
