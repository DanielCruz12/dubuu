/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";
import { type RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import {
  resetFilters,
  setRating,
  setPricing,
  setProductType,
  initialFilterState,
} from "@/redux/slices/filter/filter-slice";
import {
  setSearchTerm,
  setCountry,
  setCategories,
  setDurations,
  setPriceRange,
  setLocationEnabled,
  resetSearch,
} from "@/redux/slices/product/search/search-slice";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
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
  Navigation,
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
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { IProduct } from "@/types/product";
import { productTypes, ratingOptions } from "@/utils/data";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import { PriceRangeHistogram } from "../price-range-histogram";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const dispatch = useAppDispatch();
  const { rating, pricing, productType } = useAppSelector(
    (state: RootState) => state.filters
  );
  const {
    searchTerm,
    country,
    categories,
    durations,
    priceRange,
    isLocationEnabled,
  } = useAppSelector((state: RootState) => state.search);

  // Estados locales para aplicar los filtros al final
  const [tempRating, setTempRating] = useState(rating);
  const [tempPricing, setTempPricing] = useState(pricing);
  const [tempProductType, setTempProductType] = useState(productType);
  const [tempCategories, setTempCategories] = useState(categories);
  const [tempDurations, setTempDurations] = useState(durations);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);

  // Efecto para marcar como montado y verificar autenticación
  useEffect(() => {
    setIsMounted(true);
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  // Construir parámetros de búsqueda
  const buildSearchParams = useCallback(() => {
    const params: Record<string, any> = {};

    // Búsqueda por texto - solo si está autenticado
    if (isAuthenticated && searchTerm && searchTerm.length >= 3) {
      params.search = searchTerm;
    }

    // Filtros - disponibles para todos
    if (productType && productType !== "all") {
      params.product_type = productType;
    }

    if (isLocationEnabled && country) {
      params.country = country;
    }

    if (rating !== initialFilterState.rating) {
      params.min_rating = rating;
    }

    if (pricing !== initialFilterState.pricing) {
      params.max_price = pricing;
    }

    if (priceRange[0] > 0) {
      params.min_price = priceRange[0];
    }
    if (priceRange[1] < 1000) {
      params.max_price = priceRange[1];
    }

    if (categories.length > 0) {
      params.categories = categories.join(",");
    }

    if (durations.length > 0) {
      params.durations = durations.join(",");
    }

    params.limit = 20;

    return params;
  }, [
    searchTerm,
    productType,
    isLocationEnabled,
    country,
    rating,
    pricing,
    priceRange,
    categories,
    durations,
    isAuthenticated,
  ]);

  // Query para búsqueda en API
  const searchParams = buildSearchParams();
  const shouldSearch =
    (isAuthenticated && searchTerm.length >= 3) ||
    productType !== initialFilterState.productType ||
    (isLocationEnabled && country) ||
    rating !== initialFilterState.rating ||
    pricing !== initialFilterState.pricing ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000 ||
    categories.length > 0 ||
    durations.length > 0;

  const {
    data: searchResults,
    isLoading: isSearching,
    isFetching: isSearchFetching,
  } = useGetProductsQuery(searchParams, {
    skip: !shouldSearch,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  // Notificar estado de carga al componente padre
  useEffect(() => {
    if (onSearchLoading) {
      onSearchLoading(isSearching || isSearchFetching);
    }
  }, [isSearching, isSearchFetching, onSearchLoading]);

  // Función de geolocalización
  const requestLocation = async () => {
    if (!navigator.geolocation) return;

    setIsLoadingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
        );

        if (response.ok) {
          const data = await response.json();
          const countryName = data.countryName || data.country;
          dispatch(setCountry(countryName));
          dispatch(setLocationEnabled(true));
          localStorage.setItem("userCountry", countryName);
        }
      } catch (error) {
        console.error("Error en geocodificación:", error);
      }
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Cargar país guardado
  useEffect(() => {
    if (!isMounted) return;

    const savedCountry = localStorage.getItem("userCountry");
    if (savedCountry && !country) {
      dispatch(setCountry(savedCountry));
      dispatch(setLocationEnabled(true));
    }
  }, [country, dispatch, isMounted]);

  // Calcular filtros activos
  useEffect(() => {
    let count = 0;
    if (rating !== initialFilterState.rating) count++;
    if (pricing !== initialFilterState.pricing) count++;
    if (productType !== initialFilterState.productType) count++;
    if (categories.length > 0) count++;
    if (durations.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    if (isLocationEnabled && country) count++;
    setActiveFiltersCount(count);
  }, [
    rating,
    pricing,
    productType,
    categories,
    durations,
    priceRange,
    isLocationEnabled,
    country,
  ]);

  // Determinar qué productos mostrar con validaciones
  const displayProducts = useMemo(() => {
    if (shouldSearch) {
      // Si estamos buscando, usar resultados de la API
      const apiResults = searchResults?.data;
      return Array.isArray(apiResults) ? apiResults : [];
    } else {
      // Si no hay búsqueda activa, usar productos originales
      return Array.isArray(products) ? products : [];
    }
  }, [shouldSearch, searchResults?.data, products]);

  // Pasar resultados al componente padre con validación
  useEffect(() => {
    if (onSearchResults) {
      const validResults = Array.isArray(displayProducts)
        ? displayProducts
        : [];
      onSearchResults(validResults);
    }
  }, [displayProducts, onSearchResults]);

  const handleApplyFilters = () => {
    dispatch(setRating(tempRating));
    dispatch(setPricing(tempPricing));
    dispatch(setProductType(tempProductType));
    dispatch(setCategories(tempCategories));
    dispatch(setDurations(tempDurations));
    dispatch(setPriceRange(tempPriceRange));
    setIsDialogFilterOpen(false);
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    dispatch(resetSearch());
    setTempRating(initialFilterState.rating);
    setTempPricing(initialFilterState.pricing);
    setTempProductType(initialFilterState.productType);
    setTempCategories([]);
    setTempDurations([]);
    setTempPriceRange([0, 1000]);
    if (isMounted) {
      localStorage.removeItem("userCountry");
    }
    setIsDialogFilterOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAuthenticated) {
      dispatch(setSearchTerm(e.target.value));
    }
  };

  const handleSearchFocus = () => {
    if (isAuthenticated) {
      setIsDialogOpen(true);
    }
  };

  const handleLocationToggle = () => {
    if (isLocationEnabled) {
      dispatch(setLocationEnabled(false));
      dispatch(setCountry(null));
      if (isMounted) {
        localStorage.removeItem("userCountry");
      }
    } else {
      if (country) {
        dispatch(setLocationEnabled(true));
      } else {
        requestLocation();
      }
    }
  };

  const handleCategoryChange = useCallback(
    (category: string, checked: boolean) => {
      const newCategories = checked
        ? [...tempCategories, category]
        : tempCategories.filter((c) => c !== category);
      setTempCategories(newCategories);
    },
    [tempCategories]
  );

  const handleDurationChange = useCallback(
    (duration: string, checked: boolean) => {
      const newDurations = checked
        ? [...tempDurations, duration]
        : tempDurations.filter((d) => d !== duration);
      setTempDurations(newDurations);
    },
    [tempDurations]
  );

  // Filtrar productos para el diálogo de búsqueda con validación
  const filteredForDialog = useMemo(() => {
    if (!isAuthenticated || searchTerm.length < 3) {
      return [];
    }

    const validProducts = Array.isArray(displayProducts) ? displayProducts : [];
    const searchLower = searchTerm.toLowerCase();

    return validProducts.filter((product) => {
      if (!product || typeof product !== "object") return false;

      const name = product.name || "";
      const description = product.description || "";
      const country = product.country || "";

      return (
        name.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower) ||
        country.toLowerCase().includes(searchLower)
      );
    });
  }, [isAuthenticated, searchTerm, displayProducts]);

  // No renderizar hasta que el componente esté montado para evitar hidratación
  if (!isMounted) {
    return (
      <section className="w-full">
        {/* Skeleton/placeholder durante la hidratación */}
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
      {/* Barra de búsqueda principal */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          placeholder={
            isAuthenticated
              ? "Buscar destinos, tours, experiencias..."
              : "Inicia sesión para buscar por texto..."
          }
          className="pl-10 pr-4 py-2 h-12 rounded-full border-2 focus-visible:ring-offset-0 focus-visible:ring-1"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          disabled={!isAuthenticated}
        />
        {(isSearching || isSearchFetching) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Filtros rápidos con scroll horizontal */}
      <div className="mb-2">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 pb-1 min-w-max">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogFilterOpen(true)}
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
              onClick={handleLocationToggle}
              disabled={isLoadingLocation}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 h-9 flex-shrink-0"
            >
              <Navigation
                className={`h-3.5 w-3.5 ${isLoadingLocation ? "animate-spin" : ""}`}
              />
              <span>
                {isLocationEnabled && country
                  ? country
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

          {isLocationEnabled && country && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 gap-1.5 flex items-center"
            >
              <Navigation className="h-3 w-3 text-blue-600" />
              {country}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={handleLocationToggle}
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
              onClick={handleResetFilters}
              className="text-xs h-7 px-2 rounded-full"
            >
              Limpiar todos
            </Button>
          )}
        </div>
      )}

      {/* Diálogo de resultados de búsqueda */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  className="pl-10 pr-10 h-10 text-sm rounded-full"
                  placeholder="¿Qué estás buscando?"
                  value={searchTerm}
                  onChange={handleSearchChange}
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

          {/* Search Results */}
          <div className="h-[60vh] md:h-[50vh] w-full flex flex-col">
            <ScrollArea className="flex-grow w-full p-5">
              {searchTerm.length < 3 ? (
                <div className="flex flex-col items-center justify-center gap-3 mt-6">
                  <Search className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-center text-muted-foreground text-sm">
                    Escribe al menos 3 caracteres para iniciar la búsqueda
                  </p>
                </div>
              ) : filteredForDialog.length === 0 ? (
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
                      {filteredForDialog.length} resultado
                      {filteredForDialog.length !== 1 ? "s" : ""} para
                      {searchTerm}
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
                    {filteredForDialog.map((tour, index) => {
                      // Asegurar que tour tenga un id válido
                      const tourId = tour?.id || `tour-${index}`;
                      const tourName = tour?.name || "Sin nombre";
                      const tourPrice = tour?.price || 0;
                      const tourRating = Number(tour?.average_rating) || 0;
                      const tourReviews = tour?.total_reviews || 0;
                      const tourCountry = tour?.country || "";
                      const tourImages = tour?.images || [];
                      const tourCategory = tour?.product_category;

                      return (
                        <div
                          key={tourId}
                          className="group p-3 border border-primary/10 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 flex gap-3"
                        >
                          <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={
                                tourImages[0] ||
                                "/placeholder.svg?height=200&width=200"
                              }
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

                            {tourCountry && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{tourCountry}</span>
                              </div>
                            )}

                            <div className="mt-1 font-medium text-sm">
                              ${tourPrice} USD
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

              {/* Precio con slider */}
              <div className="pt-1 px-2 md:col-span-2">
                <PriceRangeHistogram
                  value={tempPriceRange}
                  onValueChange={(value: [number, number]) =>
                    setTempPriceRange(value)
                  }
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
                          handleCategoryChange(category, checked === true)
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
                <label className="text-xs font-medium mb-2 block">
                  Duración
                </label>
                <div className="space-y-2">
                  {["1-dia", "2-3-dias", "mas-de-3-dias"].map((duration) => (
                    <div key={duration} className="flex items-center space-x-2">
                      <Checkbox
                        id={duration}
                        checked={tempDurations.includes(duration)}
                        onCheckedChange={(checked) =>
                          handleDurationChange(duration, checked === true)
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
