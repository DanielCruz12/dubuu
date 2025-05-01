"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon, PlusCircle, SearchIcon } from "lucide-react";
import { toursColumns } from "../(columns)/columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToExcel } from "@/lib/excelFn";
import { DataTable } from "@/components/data-table/datatable";
import { useUser } from "@clerk/nextjs";
import { useGetProductsByUserIdQuery } from "@/redux/slices/product/product-slice";
import { isProductType } from "@/utils";
import type { IProduct, ITourProduct } from "@/types/product";
import { format } from "date-fns";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductsDataTable() {
  const { user } = useUser();
  const [selectedTourId, setSelectedTourId] = useState<string>("");
  const [selectedDateId, setSelectedDateId] = useState<string>("");
  const [filteredTours, setFilteredTours] = useState<
    (ITourProduct & { selectedDateId?: string })[]
  >([]);
  const [availableTours, setAvailableTours] = useState<ITourProduct[]>([]);
  const [openTourSelect, setOpenTourSelect] = useState(false);

  const { data, isLoading } = useGetProductsByUserIdQuery(user?.id as string, {
    skip: !user?.id,
  });

  // Obtener fechas disponibles para el tour seleccionado
  const availableDates = useMemo(() => {
    if (!selectedTourId) return [];
    const selectedTour = availableTours.find(
      (tour) => tour.id === selectedTourId
    );
    return selectedTour?.tour.tour_dates || [];
  }, [selectedTourId, availableTours]);

  // Manejar el cambio de producto seleccionado
  const handleTourChange = useCallback(
    (tourId: string) => {
      setSelectedTourId(tourId);

      // Encontrar el tour seleccionado
      const selectedTour = availableTours.find((tour) => tour.id === tourId);

      // Establecer la primera fecha como predeterminada si está disponible
      if (selectedTour && selectedTour.tour.tour_dates.length > 0) {
        setSelectedDateId(selectedTour.tour.tour_dates[0].id);
      } else {
        setSelectedDateId("");
      }
    },
    [availableTours]
  );

  /*   const handleUpdateTour = useCallback((updatedTour: Partial<ITourProduct>) => {
    console.log("Actualizando tour en la tabla:", updatedTour)
    // Aquí podrías llamar a una mutación para actualizar el tour en el backend
    // Y luego actualizar el estado local o refrescar los datos
  }, []) */

  // Procesar los datos cuando se reciben
  useEffect(() => {
    if (!data) return;

    // Filtrar solo los productos de tipo "tours" usando isProductType
    const tourProducts: ITourProduct[] = [];

    // Iterar sobre cada producto y verificar si es un tour
    data.forEach((product: IProduct) => {
      if (isProductType(product, "tours")) {
        // TypeScript sabe que product es un ITourProduct
        tourProducts.push(product);
      }
    });

    setAvailableTours(tourProducts);

    // Seleccionar automáticamente el primer tour y su primera fecha
    if (tourProducts.length > 0) {
      const firstTour = tourProducts[0];
      setSelectedTourId(firstTour.id);

      if (firstTour.tour.tour_dates.length > 0) {
        setSelectedDateId(firstTour.tour.tour_dates[0].id);
      }
    }
  }, [data]);

  // Actualizar los tours filtrados cuando cambian los criterios de filtrado
  useEffect(() => {
    if (!availableTours.length) return;

    let filtered = availableTours;

    // Si hay un tour seleccionado, filtrar solo ese tour
    if (selectedTourId) {
      filtered = filtered.filter((product) => product.id === selectedTourId);
    }

    // Añadir el selectedDateId a cada tour para que las columnas puedan acceder a él
    const toursWithSelectedDate = filtered.map((tour) => {
      // Verificar que el selectedDateId pertenezca a este tour
      const dateExists = tour.tour.tour_dates.some(
        (date) => date.id === selectedDateId
      );

      return {
        ...tour,
        selectedDateId: dateExists
          ? selectedDateId
          : tour.tour.tour_dates.length > 0
            ? tour.tour.tour_dates[0].id
            : undefined,
      };
    });

    setFilteredTours(toursWithSelectedDate);
  }, [selectedTourId, selectedDateId, availableTours]);

  // Exportar a Excel
  const handleExport = () => {
    const dataToExport = filteredTours.map((tour) => {
      // Encontrar la fecha seleccionada
      const selectedDate = tour.tour.tour_dates.find(
        (date) => date.id === tour.selectedDateId
      );

      return {
        ID: tour.id,
        Nombre: tour.name,
        Descripción: tour.description,
        Precio: tour.price,
        País: tour.country,
        Dirección: tour.address,
        "Punto de Partida": tour.tour.departure_point,
        Fecha: selectedDate
          ? format(new Date(selectedDate.date), "dd/MM/yyyy HH:mm")
          : "",
        "Máximo de Personas": selectedDate?.max_people || "",
        "Personas Reservadas": selectedDate?.people_booked || "",
        "Plazas Disponibles": selectedDate
          ? selectedDate.max_people - selectedDate.people_booked
          : "",
        Estado: tour.is_active ? "Activo" : "Inactivo",
      };
    });

    exportToExcel(dataToExport, "Tours");
  };

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-8 w-[200px] mb-6 animation-pulse" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Producto</label>
              <Popover open={openTourSelect} onOpenChange={setOpenTourSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTourSelect}
                    className="w-full justify-between"
                  >
                    {selectedTourId
                      ? availableTours.find(
                          (tour) => tour.id === selectedTourId
                        )?.name
                      : "Seleccionar producto..."}
                    <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar producto..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron productos.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-y-auto">
                        {availableTours.map((tour) => (
                          <CommandItem
                            key={tour.id}
                            value={tour.id}
                            onSelect={() => {
                              handleTourChange(tour.id);
                              setOpenTourSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTourId === tour.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {tour.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">
                Fecha del producto
              </label>
              {!selectedTourId ? (
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Seleccione un producto primero
                </div>
              ) : (
                <Select
                  value={selectedDateId}
                  onValueChange={setSelectedDateId}
                  disabled={availableDates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.length > 0 ? (
                      availableDates.map((date) => (
                        <SelectItem key={date.id} value={date.id}>
                          {format(new Date(date.date), "dd/MM/yyyy HH:mm")}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-dates" disabled>
                        No hay fechas disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex gap-2 ml-auto">
              <Button onClick={handleExport} title="Exportar a Excel">
                <DownloadIcon className="h-4 w-4 mr-2" />
                <span>Exportar</span>
              </Button>
              <Button title="Agregar nuevo tour">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Nuevo Tour</span>
              </Button>
            </div>
          </div>

          <DataTable
            columns={toursColumns}
            data={filteredTours}
            showSearch={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
