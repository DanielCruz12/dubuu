"use client";

import { useState } from "react";
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
  Star,
  MapPin,
  Wifi,
  Coffee,
  Utensils,
  Car,
  Heart,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FiltersContent from "@/components/sections/filter-section";

export default function BookingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Valores por defecto para los acordeones (todos abiertos)

  // Toggle favorito
  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((item) => item !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Datos de hoteles
  const hotels = [
    {
      id: 1,
      name: "Hotel Barcelona Plaza",
      image: "https://picsum.photos/1000?ramdom=1211.png",
      rating: 4.2,
      reviews: 420,
      location: "Centro de Barcelona, a 0.5 km del centro",
      price: 145,
      originalPrice: 180,
      badge: { text: "Oferta", color: "bg-primary" },
      amenities: [
        "WiFi gratis",
        "Desayuno incluido",
        "Restaurante",
        "Estacionamiento",
      ],
    },
    {
      id: 2,
      name: "Apartamentos Rambla Deluxe",
      image: "https://picsum.photos/1000?ramdom=1210.png",
      rating: 4.8,
      reviews: 215,
      location: "La Rambla, a 0.2 km del centro",
      price: 195,
      amenities: ["WiFi gratis", "Desayuno incluido"],
    },
    {
      id: 3,
      name: "Hostal Catalonia",
      image: "https://picsum.photos/1000?ramdom=1215.png",
      rating: 3.5,
      reviews: 180,
      location: "Barrio Gótico, a 0.8 km del centro",
      price: 75,
      badge: { text: "Económico", color: "bg-green-600" },
      amenities: ["WiFi gratis"],
    },
    {
      id: 4,
      name: "Grand Hotel Barcelona",
      image: "https://picsum.photos/1000?ramdom=1213.png",
      rating: 4.9,
      reviews: 520,
      location: "Paseo de Gracia, a 1.2 km del centro",
      price: 285,
      badge: { text: "Premium", color: "bg-purple-600" },
      amenities: [
        "WiFi gratis",
        "Desayuno incluido",
        "Restaurante",
        "Estacionamiento",
      ],
    },
  ];

  // Renderizar icono según el amenity
  const getAmenityIcon = (amenity: string) => {
    if (amenity.includes("WiFi")) return <Wifi className="w-3 h-3" />;
    if (amenity.includes("Desayuno")) return <Coffee className="w-3 h-3" />;
    if (amenity.includes("Restaurante"))
      return <Utensils className="w-3 h-3" />;
    if (amenity.includes("Estacionamiento")) return <Car className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="md:hidden mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">245 alojamientos</h2>
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
                  <FiltersContent />
                </div>
              </ScrollArea>
              <SheetFooter className="mt-4 flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full">
                  Limpiar filtros
                </Button>
                <SheetClose asChild>
                  <Button variant={"secondary"} className="w-full">Aplicar filtros</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col md:flex-row gap-6 ">
          {/* Filters - Left Column */}
          <div className="hidden md:block space-y-6">
            <div className="sticky top-20">
              <ScrollArea className="h-[calc(100vh-160px)] pr-4">
                <div className=" rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-semibold">Filtros</h2>
                  </div>

                  <FiltersContent />
                </div>
              </ScrollArea>
              <div className="my-6">
                <Button variant={"secondary"} className="w-full">
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Results - Right Column */}
          <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
              <div>
                <h2 className="text-xl font-bold">Barcelona, España</h2>
                <p className="text-sm text-muted-foreground">
                  245 alojamientos
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select className="rounded-md border border-input bg-background px-3 py-1 text-sm w-full sm:w-auto h-9">
                  <option>Recomendados</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                  <option>Mejor calificados</option>
                  <option>Más populares</option>
                </select>
              </div>
            </div>

            {/* Hotel Cards */}
            <div className="space-y-4">
              {hotels.map((hotel) => (
                <Card
                  key={hotel.id}
                  className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-muted"
                >
                  <div className="md:flex">
                    <div className="relative md:w-1/3 h-48 md:h-auto">
                      <Image
                        src={hotel.image || "/placeholder.svg"}
                        alt={hotel.name}
                        fill
                        className="object-cover"
                      />
                      {hotel.badge && (
                        <Badge
                          className={`absolute top-2 left-2 ${hotel.badge.color}`}
                        >
                          {hotel.badge.text}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 rounded-full h-8 w-8"
                        onClick={() => toggleFavorite(hotel.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${favorites.includes(hotel.id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      </Button>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold">{hotel.name}</h3>
                          <div className="flex items-center mt-1 text-amber-400">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(hotel.rating) ? "fill-current" : ""}`}
                                />
                              ))}
                            <span className="ml-2 text-muted-foreground text-sm">
                              {hotel.rating} ({hotel.reviews} reseñas)
                            </span>
                          </div>
                          <div className="flex items-center mt-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{hotel.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {hotel.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              €{hotel.originalPrice}
                            </div>
                          )}
                          <div className="text-xl font-bold text-primary">
                            €{hotel.price}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            por noche
                          </div>
                          <Button className="mt-2 w-full sm:w-auto text-sm h-8">
                            Ver disponibilidad
                          </Button>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="flex items-center gap-1 text-xs"
                          >
                            {getAmenityIcon(amenity)} {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <nav className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-md"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8 rounded-md"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-md"
                  disabled={currentPage === 5}
                  onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
