/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadIcon, PlusCircle, SearchIcon } from "lucide-react";
import { mockTours, mockTourDates } from "@/utils/mock-data";
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

export function ProductsDataTable() {
  // Preparar los datos de tours con campos adicionales
  const [tours, setTours] = useState<Tour[]>(() => {
    return mockTours.map((tour) => ({
      ...tour,
      is_active: Math.random() > 0.2, // Simular que algunos tours están inactivos
      max_people: Math.floor(Math.random() * 20) + 10, // Simular capacidad entre 10-30 personas
      dates: mockTourDates.filter((date) => date.product_id === tour.id),
    }));
  });

  const [filteredTours, setFilteredTours] = useState<Tour[]>(tours);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTourId, setSelectedTourId] = useState("");
  const [selectedDateId, setSelectedDateId] = useState("");

  // Obtener fechas disponibles para el tour seleccionado
  const [availableDates, setAvailableDates] = useState<any[]>([]);

  // Actualizar fechas disponibles cuando cambia el tour seleccionado
  useEffect(() => {
    if (selectedTourId && selectedTourId !== "all") {
      const dates = mockTourDates.filter(
        (date) => date.product_id === selectedTourId
      );
      setAvailableDates(
        dates.map((date) => ({
          id: date.id,
          date: new Date(date.date).toLocaleDateString(),
        }))
      );

      // Limpiar la fecha seleccionada
      setSelectedDateId("");
    } else {
      setAvailableDates([]);
      setSelectedDateId("");
    }
  }, [selectedTourId]);

  // Filtrar tours basados en búsqueda, tour y fecha seleccionada
  useEffect(() => {
    let filtered = [...tours];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (tour) =>
          tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tour.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tour seleccionado
    if (selectedTourId && selectedTourId !== "all") {
      filtered = filtered.filter((tour) => tour.id === selectedTourId);
    }

    // Filtrar por fecha seleccionada
    if (selectedDateId) {
      const tourIds = mockTourDates
        .filter((date) => date.id === selectedDateId)
        .map((date) => date.product_id);

      filtered = filtered.filter((tour) => tourIds.includes(tour.id));
    }

    setFilteredTours(filtered);
  }, [searchTerm, selectedTourId, selectedDateId, tours]);

  // Exportar a Excel
  const handleExport = () => {
    const dataToExport = filteredTours.map((tour) => ({
      ID: tour.id,
      Nombre: tour.name,
      Descripción: tour.description,
      Precio: tour.price,
      "Punto de Salida": tour.departure_point,
      Dirección: tour.address,
      País: tour.country,
      Estado: tour.is_active ? "Activo" : "Inactivo",
      "Capacidad Máxima": tour.max_people || 0,
      "Fechas Disponibles": tour.dates?.length || 0,
    }));

    exportToExcel(dataToExport, "Tours");
  };

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
                  {tours.map((tour) => (
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
                        {date.date}
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
