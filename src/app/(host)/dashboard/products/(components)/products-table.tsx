/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadIcon, PlusCircle, SearchIcon } from "lucide-react";
import { type Tour, toursColumns } from "../(columns)/columns";
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
import { ActionCell } from "./action-cell";

export function ProductsDataTable() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTourId, setSelectedTourId] = useState("all");
  const [selectedDateId, setSelectedDateId] = useState("");
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [availableTours, setAvailableTours] = useState<ITourProduct[]>([]);

  const { data, isLoading } = useGetProductsByUserIdQuery(user?.id as string, {
    skip: !user?.id,
  });

  const handleUpdateTour = useCallback((updatedTour: Partial<Tour>) => {
    console.log("Actualizando tour en la tabla:", updatedTour);
    // Aquí podrías llamar a una mutación para actualizar el tour en el backend
    // Y luego actualizar el estado local o refrescar los datos
  }, []);

  // Función para convertir un ITourProduct a Tour
  const mapTourProductToTour = (product: ITourProduct): Tour => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    country: product.country,
    is_active: product.is_approved,
    address: product.address || "",
    departure_point: product.tour?.departure_point || "",
    dates:
      product.tour.tour_dates?.map((date: any) => ({
        id: date.id,
        available_spots: date.available_spots,
        date: new Date(date.date).toLocaleDateString(),
      })) || [],
  });

  // Procesar los datos cuando se reciben
  useEffect(() => {
    if (!data) return;

    // Filtrar solo los productos de tipo "tours" usando isProductType
    const tourProducts: ITourProduct[] = [];

    // Iterar sobre cada producto y verificar si es un tour
    data.forEach((product: IProduct) => {
      if (isProductType(product, "tours")) {
        // Ahora TypeScript sabe que product es un ITourProduct
        tourProducts.push(product);
      }
    });

    setAvailableTours(tourProducts);

    // Convertir al formato esperado por la tabla usando nuestra función de mapeo
    const formattedTours = tourProducts.map(mapTourProductToTour);

    setFilteredTours(formattedTours);
  }, [data]);

  // Filtrar tours según búsqueda
  useEffect(() => {
    if (!availableTours.length) return;

    const filtered = availableTours
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(mapTourProductToTour);

    setFilteredTours(filtered);
  }, [searchTerm, availableTours]);

  // Filtrar por tour específico
  useEffect(() => {
    if (selectedTourId === "all" || !availableTours.length) {
      // Si se selecciona "todos", aplicar solo el filtro de búsqueda
      const filtered = availableTours
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(mapTourProductToTour);

      setFilteredTours(filtered);
    } else {
      // Filtrar por ID de tour específico
      const filtered = availableTours
        .filter((product) => product.id === selectedTourId)
        .map(mapTourProductToTour);

      setFilteredTours(filtered);
    }
  }, [selectedTourId, availableTours, searchTerm]);

  // Exportar a Excel
  const handleExport = () => {
    const dataToExport = filteredTours.map((tour) => ({
      ID: tour.id,
      Nombre: tour.name,
      Descripción: tour.description,
      Precio: tour.price,
      País: tour.country,
      Dirección: tour.address,
      "Punto de Partida": tour.departure_point,
      "Máximo de Personas": tour.dates?.[0]?.available_spots,
      Estado: tour.is_active ? "Activo" : "Inactivo",
    }));

    exportToExcel(dataToExport, "Tours");
  };

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  // Obtener fechas disponibles para el tour seleccionado
  const selectedTour =
    selectedTourId !== "all"
      ? availableTours.find((tour) => tour.id === selectedTourId)
      : null;

  // CORRECCIÓN: Accedemos a tour_dates directamente desde el tour seleccionado
  const availableDates = selectedTour?.tour.tour_dates || [];

  const columnsWithActions = [...toursColumns];
  // Reemplazamos la última columna (acciones) con nuestra versión personalizada
  if (columnsWithActions[columnsWithActions.length - 1].id === "actions") {
    columnsWithActions[columnsWithActions.length - 1] = {
      id: "actions",
      cell: ({ row }) => (
        <ActionCell tour={row.original} onUpdate={handleUpdateTour} />
      ),
    };
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Buscar</label>
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="w-full md:w-1/4">
              <label className="text-sm font-medium mb-1 block">Tour</label>
              <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tours</SelectItem>
                  {availableTours.map((tour) => (
                    <SelectItem key={tour.id} value={tour.id}>
                      {tour.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/4">
              <label className="text-sm font-medium mb-1 block">Fecha</label>
              <Select
                value={selectedDateId}
                onValueChange={setSelectedDateId}
                disabled={!selectedTourId || selectedTourId === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fecha" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.length > 0 ? (
                    availableDates.map((date) => (
                      <SelectItem key={date.id} value={date.id}>
                        {new Date(date.date).toLocaleDateString()}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-dates" disabled>
                      {selectedTourId && selectedTourId !== "all"
                        ? "No hay fechas disponibles"
                        : "Seleccione un tour primero"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
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
