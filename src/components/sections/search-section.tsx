"use client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Search, RefreshCw, FilterIcon } from "lucide-react";
import type { IProduct } from "@/types/product";
import { useSearchLogic } from "@/hooks/use-search-logic";
import { SearchFilters } from "./search/search-filters";
import { FilterDialog, SearchDialog } from "./search/search-dialogs";
import { useLanguage } from "@/lib/i18n-context";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchSectionProps {
  products: IProduct[];
  onSearchResults?: (products: IProduct[]) => void;
  onSearchLoading?: (loading: boolean) => void;
}

function SearchSectionSkeleton() {
  return (
    <section className="w-full">
      <div className="flex items-stretch gap-2 mb-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <Skeleton className="h-12 flex-1 min-w-0 rounded-full" />
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-full flex-shrink-0" />
          <Skeleton className="h-9 w-20 rounded-full flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}

export default function SearchSection({
  products,
  onSearchResults,
  onSearchLoading,
}: SearchSectionProps) {
  const { t, isReady } = useLanguage();
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
    priceRange,
    isLocationEnabled,
    rating,
    productType,
    tempRating,
    setTempRating,
    tempProductType,
    setTempProductType,
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
  } = useSearchLogic({ products, onSearchResults, onSearchLoading });

  // Skeletons mientras no está montado o i18n no está listo (evita hidratación y texto crudo)
  if (!isMounted || !isReady) {
    return <SearchSectionSkeleton />;
  }

  return (
    <section className="w-full">
      {/* Filtros al inicio + buscador (misma fila, mobile y desktop) */}
      <div className="flex items-stretch gap-2 mb-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDialogFilterOpen(true)}
          className="h-12 shrink-0 rounded-full border-2 px-3 sm:px-4 flex items-center gap-1.5"
          aria-label={t("common.filters")}
        >
          <FilterIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm whitespace-nowrap">{t("common.filters")}</span>
          {activeFiltersCount > 0 && (
            <Badge className="h-5 min-w-5 rounded-full px-1.5 flex items-center justify-center text-[10px]">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder={
              user
                ? t("home.search.placeholder")
                : t("home.search.placeholderNotLogged")
            }
            className="pl-10 py-2 h-12 w-full rounded-full border-2 focus-visible:ring-offset-0 focus-visible:ring-1 pr-11"
            value={searchTerm ?? ""}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            disabled={!user}
          />
          {(isSearching || isSearchFetching) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <SearchFilters
        activeFiltersCount={activeFiltersCount}
        productType={productType}
        rating={rating}
        priceRange={priceRange}
        onResetFilters={handleResetFilters}
        dispatch={dispatch}
        isLocationEnabled={isLocationEnabled}
        country={country}
        onLocationToggle={handleLocationToggle}
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
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        isLocationEnabled={isLocationEnabled}
        country={country}
        isLoadingLocation={isLoadingLocation}
        onLocationToggle={handleLocationToggle}
      />
    </section>
  );
}
