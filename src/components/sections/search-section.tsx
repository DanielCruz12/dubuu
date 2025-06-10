"use client";
import { Input } from "../ui/input";
import { Search, RefreshCw, FilterIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import type { IProduct } from "@/types/product";
import { useSearchLogic } from "@/hooks/use-search-logic";
import { SearchFilters } from "./search/search-filters";
import { FilterDialog, SearchDialog } from "./search/search-dialogs";

interface SearchSectionProps {
  products: IProduct[];
  onSearchResults?: (products: IProduct[]) => void;
  onSearchLoading?: (loading: boolean) => void;
}

export default function SearchSection({
  products,
  onSearchResults,
  onSearchLoading,
}: SearchSectionProps) {
  const {
    // State
    isDialogOpen,
    setIsDialogOpen,
    isDialogFilterOpen,
    setIsDialogFilterOpen,
    activeFiltersCount,
    isLoadingLocation,
    isMounted,
    user,
    searchTerm,
    country,
    categories,
    durations,
    priceRange,
    isLocationEnabled,
    rating,
    productType,
    tempRating,
    setTempRating,
    tempProductType,
    setTempProductType,
    tempCategories,
    tempDurations,
    tempPriceRange,
    setTempPriceRange,
    isSearching,
    isSearchFetching,
    filteredForDialog,
    dispatch,
    // Handlers
    handleApplyFilters,
    handleResetFilters,
    handleSearchChange,
    handleSearchFocus,
    handleLocationToggle,
    handleCategoryChange,
    handleDurationChange,
  } = useSearchLogic({ products, onSearchResults, onSearchLoading });

  // No renderizar hasta que el componente esté montado para evitar hidratación
  if (!isMounted) {
    return (
      <section className="w-full">
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Cargando..."
            className="pl-10 pr-4 py-2 h-12 rounded-full border-2 focus-visible:ring-offset-0 focus-visible:ring-1"
            disabled
          />
        </div>
        <div className="mb-2">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-2 pb-1 min-w-max">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 py-1 h-9 flex-shrink-0"
              >
                <FilterIcon className="h-3.5 w-3.5" />
                <span>Filtros</span>
              </Button>
            </div>
          </ScrollArea>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      {/* Mensaje para usuarios no autenticados */}
      {!user && (
        <div className="mb-3 text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded-lg">
          Debes iniciar sesión para buscar por texto. Los filtros están
          disponibles.
        </div>
      )}

      {/* Barra de búsqueda principal */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          placeholder={
            user
              ? "Buscar destinos, tours, experiencias..."
              : "Inicia sesión para buscar por texto..."
          }
          className="pl-10 pr-4 py-2 h-12 rounded-full border-2 focus-visible:ring-offset-0 focus-visible:ring-1"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          disabled={!user}
        />
        {(isSearching || isSearchFetching) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Filtros */}
      <SearchFilters
        activeFiltersCount={activeFiltersCount}
        onFilterDialogOpen={() => setIsDialogFilterOpen(true)}
        isLocationEnabled={isLocationEnabled}
        country={country}
        isLoadingLocation={isLoadingLocation}
        onLocationToggle={handleLocationToggle}
        productType={productType}
        rating={rating}
        categories={categories}
        durations={durations}
        priceRange={priceRange}
        onResetFilters={handleResetFilters}
        dispatch={dispatch}
      />

      {/* Diálogos */}
      <SearchDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filteredProducts={filteredForDialog}
        dispatch={dispatch}
      />

      <FilterDialog
        isOpen={isDialogFilterOpen}
        onOpenChange={setIsDialogFilterOpen}
        tempProductType={tempProductType}
        setTempProductType={setTempProductType}
        tempRating={tempRating}
        setTempRating={setTempRating}
        tempPriceRange={tempPriceRange}
        setTempPriceRange={setTempPriceRange}
        tempCategories={tempCategories}
        tempDurations={tempDurations}
        onCategoryChange={handleCategoryChange}
        onDurationChange={handleDurationChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </section>
  );
}
