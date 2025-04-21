"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
  SheetDescription,
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
  Clock,
  Users,
  Tag,
} from "lucide-react";
import FiltersContent from "@/components/sections/filter-section";

// Define the tour type based on the provided data
interface Tour {
  id: string;
  name: string;
  user_id: string;
  description: string;
  price: string;
  address: string;
  country: string;
  is_approved: boolean;
  images: string[];
  files: string[];
  videos: string[];
  banner: string;
  is_active: boolean;
  average_rating: string;
  total_reviews: number;
  target_product_audience_id: string;
  product_category_id: string;
  product_type_id: string;
  created_at: string;
  updated_at: string;
  product_category: {
    id: string;
    name: string;
  };
  target_audience: {
    id: string;
    name: string;
  };
  product_type: {
    id: string;
    name: string;
  };
  tour: {
    duration: number;
  };
}

// Sample data
const sampleTours: Tour[] = [
  {
    id: "e9cbb500-8c57-4225-a3de-5673423b438c",
    name: "Exploración Volcán de Santa Ana",
    user_id: "user_2veqnkB4eeA75VaFcmN9YgQlX6H",
    description:
      "Ascenso guiado al majestuoso volcán Ilamatepec, disfrutando vistas panorámicas y un merecido descanso en aguas termales al finalizar.",
    price: "20.99",
    address: "Volcán de Santa Ana, Cerro Verde",
    country: "El Salvador",
    is_approved: true,
    images: [
      "https://picsum.photos/id/1015/1000/600.jpg",
      "https://picsum.photos/id/1011/1000/600.jpg",
      "https://picsum.photos/id/1016/1000/600.jpg",
      "https://picsum.photos/id/1020/1000/500.jpg",
    ],
    files: [
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    ],
    videos: ["https://samplelib.com/lib/preview/mp4/sample-5s.mp4"],
    banner: "https://picsum.photos/id/1035/1000/600.jpg",
    is_active: true,
    average_rating: "4.00",
    total_reviews: 1,
    target_product_audience_id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    product_category_id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
    product_type_id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
    created_at: "2025-04-14T23:03:48.832Z",
    updated_at: "2025-04-14T23:03:48.832Z",
    product_category: {
      id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
      name: "Aventura",
    },
    target_audience: {
      id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
      name: "familiar",
    },
    product_type: {
      id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
      name: "tours",
    },
    tour: {
      duration: 1,
    },
  },
  // Adding more sample tours with different countries
  {
    id: "f8dbb600-9c57-4225-b3de-6783423b439d",
    name: "Tour por la Ciudad Colonial",
    user_id: "user_3veqnkB4eeA75VaFcmN9YgQlX6H",
    description:
      "Recorrido por las calles históricas de la ciudad colonial, visitando monumentos y edificios emblemáticos.",
    price: "15.99",
    address: "Centro Histórico",
    country: "República Dominicana",
    is_approved: true,
    images: [
      "https://picsum.photos/id/1025/1000/600.jpg",
      "https://picsum.photos/id/1026/1000/600.jpg",
      "https://picsum.photos/id/1027/1000/600.jpg",
    ],
    files: [],
    videos: [],
    banner: "https://picsum.photos/id/1036/1000/600.jpg",
    is_active: true,
    average_rating: "4.50",
    total_reviews: 2,
    target_product_audience_id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    product_category_id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
    product_type_id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
    created_at: "2025-04-14T23:03:48.832Z",
    updated_at: "2025-04-14T23:03:48.832Z",
    product_category: {
      id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
      name: "Cultural",
    },
    target_audience: {
      id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
      name: "familiar",
    },
    product_type: {
      id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
      name: "tours",
    },
    tour: {
      duration: 3,
    },
  },
  {
    id: "g7ebb700-7d57-4225-c3de-7893423b440e",
    name: "Aventura en Cenotes",
    user_id: "user_4veqnkB4eeA75VaFcmN9YgQlX6H",
    description:
      "Explora los misteriosos cenotes de la península de Yucatán, nadando en aguas cristalinas y descubriendo formaciones subterráneas.",
    price: "35.99",
    address: "Riviera Maya",
    country: "México",
    is_approved: true,
    images: [
      "https://picsum.photos/id/1035/1000/600.jpg",
      "https://picsum.photos/id/1036/1000/600.jpg",
      "https://picsum.photos/id/1037/1000/600.jpg",
    ],
    files: [],
    videos: [],
    banner: "https://picsum.photos/id/1037/1000/600.jpg",
    is_active: true,
    average_rating: "4.80",
    total_reviews: 5,
    target_product_audience_id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    product_category_id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
    product_type_id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
    created_at: "2025-04-14T23:03:48.832Z",
    updated_at: "2025-04-14T23:03:48.832Z",
    product_category: {
      id: "a040faa5-5987-4011-b549-3ea0ffbaf862",
      name: "Aventura",
    },
    target_audience: {
      id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
      name: "familiar",
    },
    product_type: {
      id: "c732fe6e-324d-40bb-a629-9cc0e26c0253",
      name: "tours",
    },
    tour: {
      duration: 2,
    },
  },
];

// Define filter types
export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  durations: string[];
  sortBy: string;
}

export default function ToursPage() {
  const router = useRouter();
  const [allTours] = useState<Tour[]>(sampleTours);
  const [filteredTours, setFilteredTours] = useState<Tour[]>(sampleTours);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [itemsPerPage] = useState(2);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100],
    categories: [],
    durations: [],
    sortBy: "recommended",
  });

  // Apply filters
  useEffect(() => {
    let result = [...allTours];

    // Filter by price
    result = result.filter((tour) => {
      const price = Number.parseFloat(tour.price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
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
  }, [filters, allTours]);

  // Update filters
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 100],
      categories: [],
      durations: [],
      sortBy: "recommended",
    });
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

  return (
    <div className="pb-4">
      <div className="md:hidden mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{filteredTours.length} tours</h2>
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
              <SheetDescription></SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="pr-4">
                <FiltersContent
                  filters={filters}
                  updateFilters={updateFilters}
                />
              </div>
            </ScrollArea>
            <SheetFooter className="mt-4 flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
                Limpiar filtros
              </Button>
              <SheetClose asChild>
                <Button variant="secondary" className="w-full">
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
                <FiltersContent
                  filters={filters}
                  updateFilters={updateFilters}
                />
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
              <Button variant="secondary" className="w-full">
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Results - Right Column */}
        <div className="w-full md:w-3/4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
            <div>
              <h2 className="text-xl font-bold">Todos los tours</h2>
              <p className="text-sm text-muted-foreground">
                {filteredTours.length}{" "}
                {filteredTours.length === 1 ? "tour" : "tours"}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="rounded-md border border-input bg-background px-3 py-1 text-sm w-full sm:w-auto h-9"
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
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
                  className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-muted"
                >
                  <div className="md:flex">
                    <div className="relative md:w-1/3 h-48 md:h-auto">
                      {tour.images.length > 1 ? (
                        <Carousel className="w-full h-full">
                          <CarouselContent>
                            {tour.images.map((image, index) => (
                              <CarouselItem
                                key={index}
                                className="relative md:w-1/3 h-48 md:h-52"
                              >
                                <Image
                                  src={image}
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
                        onClick={() => toggleFavorite(tour.id)}
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
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            ${tour.price}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            por persona
                          </div>
                          <Button
                            className="mt-2 w-full sm:w-auto text-sm h-8"
                            onClick={() =>
                              router.push(`/home/tours/${tour.id}`)
                            }
                          >
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <Clock className="h-3 w-3" /> {tour.tour.duration}{" "}
                          {tour.tour.duration === 1 ? "día" : "días"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <Users className="h-3 w-3" />{" "}
                          {tour.target_audience.name}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <Tag className="h-3 w-3" /> {tour.product_type.name}
                        </Badge>
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
