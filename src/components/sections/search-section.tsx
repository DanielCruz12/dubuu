"use client";

import { useState, useEffect } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import {
  resetFilters,
  setRating,
  setPricing,
  setProductType,
  initialFilterState,
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
  RefreshCw,
  Search,
  Star,
  X,
  MapPin,
} from "lucide-react";
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
import { productTypes, ratingOptions } from "@/utils/data";
import { ScrollArea } from "../ui/scroll-area";

export default function SearchSection({ products }: { products: IProduct[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const dispatch = useAppDispatch();
  const { rating, pricing, productType } = useAppSelector(
    (state: RootState) => state.filters
  );

  // Estados locales para aplicar los filtros al final
  const [tempRating, setTempRating] = useState(rating);
  const [tempPricing, setTempPricing] = useState(pricing);
  const [tempProductType, setTempProductType] = useState(productType);

  // Calcular el número de filtros activos
  useEffect(() => {
    let count = 0;
    if (rating !== initialFilterState.rating) count++;
    if (pricing !== initialFilterState.pricing) count++;
    if (productType !== initialFilterState.productType) count++;
    setActiveFiltersCount(count);
  }, [rating, pricing, productType]);

  const handleApplyFilters = () => {
    dispatch(setRating(tempRating));
    dispatch(setPricing(tempPricing));
    dispatch(setProductType(tempProductType));
    setIsDialogFilterOpen(false);
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setTempRating(initialFilterState.rating);
    setTempPricing(initialFilterState.pricing);
    setTempProductType(initialFilterState.productType);
    setIsDialogFilterOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    setIsDialogOpen(true);
  };

  // Filtrar productos basados en el término de búsqueda
  const filteredBySearch =
    searchTerm.length > 2
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            product.country?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  return (
    <section className="w-full ">
      {/* Barra de búsqueda principal */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          placeholder="Buscar destinos, tours, experiencias..."
          className="pl-10 pr-4 py-2 h-12 rounded-full border-2 focus-visible:ring-offset-0 focus-visible:ring-1"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
        />
      </div>

      {/* Filtros rápidos */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogFilterOpen(true)}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 py-1 h-9"
        >
          <FilterIcon className="h-3.5 w-3.5" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <ScrollArea className="w-full">
          <div className="flex gap-2">
            {productTypes.map(({ name, id, description }) => (
              <Button
                key={id}
                variant={productType === name ? "default" : "outline"}
                size="sm"
                onClick={() => dispatch(setProductType(name))}
                className="rounded-full whitespace-nowrap px-3 py-1 h-9"
              >
                {description}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {rating !== initialFilterState.rating && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 gap-1.5 flex items-center"
            >
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {ratingOptions.find((opt) => opt.value === rating)?.label ||
                rating}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => dispatch(setRating(initialFilterState.rating))}
              />
            </Badge>
          )}

          {pricing !== initialFilterState.pricing && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 gap-1.5 flex items-center"
            >
              <DollarSign className="h-3 w-3 text-green-600" />
              Máx: ${pricing}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => dispatch(setPricing(initialFilterState.pricing))}
              />
            </Badge>
          )}

          {productType !== initialFilterState.productType &&
            productType !== "all" && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 gap-1.5 flex items-center"
              >
                <MapPin className="h-3 w-3 text-primary" />
                {productTypes.find((pt) => pt.name === productType)
                  ?.description || productType}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() =>
                    dispatch(setProductType(initialFilterState.productType))
                  }
                />
              </Badge>
            )}

          {activeFiltersCount > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs h-7 px-2 rounded-full"
            >
              Limpiar todos
            </Button>
          )}
        </div>
      )}

      {/* Diálogo de resultados de búsqueda */}
      <ResultDialog
        products={filteredBySearch}
        searchTerm={searchTerm}
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
      />

      {/* Diálogo de filtros */}
      <Dialog open={isDialogFilterOpen} onOpenChange={setIsDialogFilterOpen}>
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
                  onValueChange={(value) => setTempProductType(value)}
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
                <Select
                  value={tempRating}
                  onValueChange={(value) => setTempRating(value)}
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

              {/* Precio */}
              <div className="pt-1 px-2 md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium inline-flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    Precio máximo
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
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-sm px-4 flex items-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Restablecer
              </Button>
              <Button
                size="sm"
                className="h-9 text-sm px-4 flex items-center gap-2"
                onClick={handleApplyFilters}
              >
                Aplicar filtros
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
