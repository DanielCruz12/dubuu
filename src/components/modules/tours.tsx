"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Star,
  MapPin,
  Heart,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { sampleTours, Tour } from "@/utils/data";
import { normalizeCountryForUrl } from "@/utils";

// Define filter types
export interface FilterState {
  priceRange: number;
  categories: string[];
  durations: string[];
  rating: string;
  sortBy: string;
}

// Define rating options
const ratingOptions = [
  { value: "any", label: "Cualquiera" },
  { value: "3", label: "3+ estrellas" },
  { value: "4", label: "4+ estrellas" },
  { value: "5", label: "5 estrellas" },
];

export default function ToursPage({
  countryFilter,
}: {
  countryFilter?: string;
}) {
  const router = useRouter();
  const [allTours] = useState<Tour[]>(sampleTours);
  const [filteredTours, setFilteredTours] = useState<Tour[]>(sampleTours);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [itemsPerPage] = useState(3);

  // Temporary filter state (before applying)
  const [tempFilters, setTempFilters] = useState<FilterState>({
    priceRange: 1000,
    categories: [],
    durations: [],
    rating: "any",
    sortBy: "recommended",
  });

  // Applied filter state
  const [filters, setFilters] = useState<FilterState>({
    priceRange: 1000,
    categories: [],
    durations: [],
    rating: "any",
    sortBy: "recommended",
  });

  // Apply country filter from URL if provided
  useEffect(() => {
    if (countryFilter && countryFilter !== "all") {
      let result = [...allTours];

      // Filter by country - exact match with the country name
      result = result.filter((tour) => tour.country === countryFilter);

      setFilteredTours(result);
    } else {
      setFilteredTours(allTours);
    }
  }, [countryFilter, allTours]);

  // Apply filters
  useEffect(() => {
    let result = [...allTours];

    // Apply country filter if provided
    if (countryFilter && countryFilter !== "all") {
      result = result.filter((tour) => tour.country === countryFilter);
    }

    // Filter by price
    result = result.filter((tour) => {
      const price = Number.parseFloat(tour.price);
      return price <= filters.priceRange;
    });

    // Filter by categories
    if (filters.categories.length > 0) {
      result = result.filter((tour) =>
        filters.categories.includes(tour.product_category.name.toLowerCase())
      );
    }

    // Filter by duration
    if (filters.durations.length > 0) {
      result = result.filter((tour) => {
        const duration = tour.tour.duration;

        if (filters.durations.includes("1-dia") && duration === 1) return true;
        if (
          filters.durations.includes("2-3-dias") &&
          duration >= 2 &&
          duration <= 3
        )
          return true;
        if (filters.durations.includes("mas-de-3-dias") && duration > 3)
          return true;

        return false;
      });
    }

    // Filter by rating
    if (filters.rating !== "any") {
      const minRating = Number(filters.rating);
      result = result.filter(
        (tour) => Number(tour.average_rating) >= minRating
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "price-asc":
        result.sort(
          (a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price)
        );
        break;
      case "price-desc":
        result.sort(
          (a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price)
        );
        break;
      case "rating":
        result.sort(
          (a, b) =>
            Number.parseFloat(b.average_rating) -
            Number.parseFloat(a.average_rating)
        );
        break;
      case "popularity":
        result.sort((a, b) => b.total_reviews - a.total_reviews);
        break;
      default:
        // Default sorting (recommended) - we'll use a combination of rating and reviews
        result.sort((a, b) => {
          const scoreA =
            Number.parseFloat(a.average_rating) * 0.7 + a.total_reviews * 0.3;
          const scoreB =
            Number.parseFloat(b.average_rating) * 0.7 + b.total_reviews * 0.3;
          return scoreB - scoreA;
        });
    }

    setFilteredTours(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, allTours, countryFilter]);

  // Apply filters from temporary state
  const applyFilters = () => {
    setFilters(tempFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      priceRange: 1000,
      categories: [],
      durations: [],
      rating: "any",
      sortBy: "recommended",
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTours = filteredTours.slice(indexOfFirstItem, indexOfLastItem);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((item) => item !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Handle pagination
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Navigate to tour detail
  const navigateToTour = (tour: Tour) => {
    // Normalize the country name for the URL
    const normalizedCountry = normalizeCountryForUrl(tour.country);
    router.push(`/home/tours/${normalizedCountry}/${tour.id}`);
  };

  // Get page title based on country filter
  const getPageTitle = () => {
    if (!countryFilter || countryFilter === "all") {
      return "Todos los viajes";
    }
    return `Viajes en ${countryFilter}`;
  };

  return (
    <div className="pb-4">
      <div className="md:hidden mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{filteredTours.length} viajes</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-left">Filtros</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="pr-4 space-y-6">
                {/* Price Filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Precio</h3>
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
                        ${tempFilters.priceRange}
                      </Badge>
                    </div>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={[tempFilters.priceRange]}
                      onValueChange={(value) =>
                        setTempFilters({ ...tempFilters, priceRange: value[0] })
                      }
                      className="py-0"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>$0</span>
                      <span>$1000</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Calificación</h3>
                  <div>
                    <label className="text-xs font-medium mb-1 inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      Calificación
                    </label>
                    <Select
                      value={tempFilters.rating}
                      onValueChange={(value) =>
                        setTempFilters({ ...tempFilters, rating: value })
                      }
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
                </div>

                {/* Categories Filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Categorías</h3>
                  <div className="space-y-2">
                    {["aventura", "cultural", "naturaleza"].map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category}`}
                          checked={tempFilters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTempFilters({
                                ...tempFilters,
                                categories: [
                                  ...tempFilters.categories,
                                  category,
                                ],
                              });
                            } else {
                              setTempFilters({
                                ...tempFilters,
                                categories: tempFilters.categories.filter(
                                  (c) => c !== category
                                ),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Duración</h3>
                  <div className="space-y-2">
                    {[
                      { id: "1-dia", label: "1 día" },
                      { id: "2-3-dias", label: "2-3 días" },
                      { id: "mas-de-3-dias", label: "Más de 3 días" },
                    ].map((duration) => (
                      <div
                        key={duration.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`duration-${duration.id}`}
                          checked={tempFilters.durations.includes(duration.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTempFilters({
                                ...tempFilters,
                                durations: [
                                  ...tempFilters.durations,
                                  duration.id,
                                ],
                              });
                            } else {
                              setTempFilters({
                                ...tempFilters,
                                durations: tempFilters.durations.filter(
                                  (d) => d !== duration.id
                                ),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`duration-${duration.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {duration.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <SheetFooter className="mt-4 flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  resetFilters();
                }}
              >
                Limpiar filtros
              </Button>
              <SheetClose asChild>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={applyFilters}
                >
                  Aplicar filtros
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters - Left Column */}
        <div className="hidden md:block space-y-6 w-1/4">
          <div className="sticky top-20">
            <ScrollArea className="h-[calc(100vh-160px)] pr-4">
              <div className="rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold">Filtros</h2>
                </div>

                {/* Price Filter */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-semibold">Precio</h3>
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
                        ${tempFilters.priceRange}
                      </Badge>
                    </div>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={[tempFilters.priceRange]}
                      onValueChange={(value) =>
                        setTempFilters({ ...tempFilters, priceRange: value[0] })
                      }
                      className="py-0"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>$0</span>
                      <span>$1000</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-semibold">Calificación</h3>
                  <div>
                    <label className="text-xs font-medium mb-1 inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      Calificación
                    </label>
                    <Select
                      value={tempFilters.rating}
                      onValueChange={(value) =>
                        setTempFilters({ ...tempFilters, rating: value })
                      }
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
                </div>

                {/* Categories Filter */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-semibold">Categorías</h3>
                  <div className="space-y-2">
                    {["aventura", "cultural", "naturaleza"].map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`desktop-category-${category}`}
                          checked={tempFilters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTempFilters({
                                ...tempFilters,
                                categories: [
                                  ...tempFilters.categories,
                                  category,
                                ],
                              });
                            } else {
                              setTempFilters({
                                ...tempFilters,
                                categories: tempFilters.categories.filter(
                                  (c) => c !== category
                                ),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`desktop-category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Duración</h3>
                  <div className="space-y-2">
                    {[
                      { id: "1-dia", label: "1 día" },
                      { id: "2-3-dias", label: "2-3 días" },
                      { id: "mas-de-3-dias", label: "Más de 3 días" },
                    ].map((duration) => (
                      <div
                        key={duration.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`desktop-duration-${duration.id}`}
                          checked={tempFilters.durations.includes(duration.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTempFilters({
                                ...tempFilters,
                                durations: [
                                  ...tempFilters.durations,
                                  duration.id,
                                ],
                              });
                            } else {
                              setTempFilters({
                                ...tempFilters,
                                durations: tempFilters.durations.filter(
                                  (d) => d !== duration.id
                                ),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`desktop-duration-${duration.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {duration.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="my-6 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
                Limpiar filtros
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={applyFilters}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Results - Right Column */}
        <div className="w-full md:w-3/4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
            <div>
              <h2 className="text-xl font-bold">{getPageTitle()}</h2>
              <p className="text-sm text-muted-foreground">
                {filteredTours.length}{" "}
                {filteredTours.length === 1 ? "tour" : "tours"}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="rounded-md border border-input bg-background px-3 py-1 text-sm w-full sm:w-auto h-9"
                value={filters.sortBy}
                onChange={(e) => {
                  setTempFilters({ ...tempFilters, sortBy: e.target.value });
                  setFilters({ ...filters, sortBy: e.target.value });
                }}
              >
                <option value="recommended">Recomendados</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="rating">Mejor calificados</option>
                <option value="popularity">Más populares</option>
              </select>
            </div>
          </div>

          {/* Tour Cards */}
          <div className="space-y-4">
            {currentTours.length > 0 ? (
              currentTours.map((tour) => (
                <Card
                  key={tour.id}
                  className="overflow-hidden mb-5 hover:shadow-md transition-shadow duration-300 border-muted"
                >
                  <div className="md:flex ">
                    <div className="relative md:w-1/3 h-48 md:h-auto">
                      {tour.images.length > 1 ? (
                        <Carousel className="w-full h-full">
                          <CarouselContent>
                            {tour.images.map((image, index) => (
                              <CarouselItem
                                key={index}
                                className="relative md:w-full h-48 md:h-52"
                              >
                                <Image
                                  src={image || "/tour.jpg"}
                                  alt={tour.name}
                                  fill
                                  className="object-cover"
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </Carousel>
                      ) : (
                        <Image
                          src={tour.images[0] || tour.banner}
                          alt={tour.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <Badge className="absolute top-2 left-2 bg-primary">
                        {tour.product_category.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 rounded-full h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tour.id);
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${favorites.includes(tour.id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      </Button>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold">{tour.name}</h3>
                          <div className="flex items-center mt-1 text-amber-400">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(Number.parseFloat(tour.average_rating)) ? "fill-current" : ""}`}
                                />
                              ))}
                            <span className="ml-2 text-muted-foreground text-sm">
                              {tour.average_rating} ({tour.total_reviews}{" "}
                              {tour.total_reviews === 1 ? "reseña" : "reseñas"})
                            </span>
                          </div>
                          <div className="flex items-center mt-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {tour.address}, {tour.country}
                            </span>
                          </div>
                          <p className="mt-2 text-sm line-clamp-2">
                            {tour.description}
                          </p>
                        </div>

                        <div>
                          {/* Mobile view - price and button in same row */}
                          <div className="flex items-center justify-between sm:hidden">
                            <div className="font-semibold">${tour.price}</div>
                            <Button
                              className="rounded-full text-sm h-8"
                              onClick={() => navigateToTour(tour)}
                            >
                              Ver detalles
                            </Button>
                          </div>

                          {/* Desktop view - stacked with right alignment */}
                          <div className="hidden sm:block text-right">
                            <div className="text-xl font-bold text-primary">
                              ${tour.price}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              por persona
                            </div>
                            <Button
                              className="mt-2 w-full sm:w-auto text-sm h-8"
                              onClick={() => navigateToTour(tour)}
                            >
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No se encontraron tours con los filtros seleccionados.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={resetFilters}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-md"
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className="w-8 h-8 rounded-md"
                      onClick={() => paginate(page)}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-md"
                  disabled={currentPage === totalPages}
                  onClick={() => paginate(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
