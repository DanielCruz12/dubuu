/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";
import { mockBookings } from "@/utils/mock-data";
import { exportToExcel } from "@/lib/excelFn";
import { DataTable } from "@/components/data-table/datatable";
import { FilterModal } from "./filter-modal";
import { bookingsColumns } from "../(columns)/columns";

export function BookingsDataTable() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bookings, setBookings] = useState(mockBookings);
  const [filteredBookings, setFilteredBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Calculate price range from data
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 300,
  });

  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    minTotal: 0,
    maxTotal: 300,
    statuses: [] as string[],
    paymentMethods: [] as string[],
    selectedTour: "",
    selectedDate: "",
  });

  // Calculate dynamic price range on initial load
  useEffect(() => {
    if (bookings.length > 0) {
      const prices = bookings.map((booking) =>
        Number.parseFloat(booking.total)
      );
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));

      setPriceRange({
        min: minPrice,
        max: maxPrice,
      });

      // Update advanced filters with the dynamic range
      setAdvancedFilters((prev) => ({
        ...prev,
        minTotal: minPrice,
        maxTotal: maxPrice,
      }));
    }
  }, [bookings]);

  // Filter bookings based on all filters
  useEffect(() => {
    let filtered = [...bookings];

    // Basic search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tour filter
    if (advancedFilters.selectedTour) {
      filtered = filtered.filter(
        (booking) => booking.product_id === advancedFilters.selectedTour
      );
    }

    // Date filter
    if (advancedFilters.selectedDate) {
      filtered = filtered.filter(
        (booking) => booking.tour_date_id === advancedFilters.selectedDate
      );
    }

    // Price range filter
    if (advancedFilters.minTotal > priceRange.min) {
      filtered = filtered.filter(
        (booking) =>
          Number.parseFloat(booking.total) >= advancedFilters.minTotal
      );
    }

    if (advancedFilters.maxTotal < priceRange.max) {
      filtered = filtered.filter(
        (booking) =>
          Number.parseFloat(booking.total) <= advancedFilters.maxTotal
      );
    }

    // Status filter
    if (advancedFilters.statuses.length > 0) {
      filtered = filtered.filter((booking) =>
        advancedFilters.statuses.includes(booking.status)
      );
    }

    // Payment method filter
    if (advancedFilters.paymentMethods.length > 0) {
      filtered = filtered.filter((booking) =>
        advancedFilters.paymentMethods.includes(booking.paymentMethod)
      );
    }

    setFilteredBookings(filtered);
  }, [searchTerm, advancedFilters, bookings, priceRange]);

  // Handle export to Excel
  const handleExport = () => {
    const dataToExport = filteredBookings.map((booking) => ({
      "ID de Reserva": booking.id,
      "Nombre del Cliente": booking.user.name,
      Email: booking.user.email,
      Tour: booking.tour_name,
      Fecha: new Date(booking.tour_date).toLocaleDateString(),
      Boletos: booking.tickets,
      Total: `${booking.total}`,
      Estado:
        booking.status === "completed"
          ? "Completado"
          : booking.status === "pending"
            ? "Pendiente"
            : "Cancelado",
      "Método de Pago":
        booking.paymentMethod === "credit"
          ? "Tarjeta de Crédito"
          : booking.paymentMethod === "debit"
            ? "Tarjeta de Débito"
            : booking.paymentMethod === "paypal"
              ? "PayPal"
              : "Efectivo",
      "ID de Transacción": booking.idTransaccion,
      "Fecha de Reserva": new Date(booking.created_at).toLocaleDateString(),
    }));

    exportToExcel(dataToExport, "Reservas_Tours");
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setAdvancedFilters({
      minTotal: priceRange.min,
      maxTotal: priceRange.max,
      statuses: [],
      paymentMethods: [],
      selectedTour: "",
      selectedDate: "",
    });
  };

  // Apply advanced filters
  const handleApplyAdvancedFilters = (filters: any) => {
    setAdvancedFilters(filters);
  };

  // Get active filter count for badge
  const getActiveFilterCount = () => {
    let count = 0;
    if (advancedFilters.minTotal > priceRange.min) count++;
    if (advancedFilters.maxTotal < priceRange.max) count++;
    if (advancedFilters.statuses.length > 0) count++;
    if (advancedFilters.paymentMethods.length > 0) count++;
    if (advancedFilters.selectedTour) count++;
    if (advancedFilters.selectedDate) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="w-full md:w-2/3">
              <label className="text-sm font-medium mb-1 block">Buscar</label>
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => setFilterModalOpen(true)}
                title="Filtros avanzados"
                className="relative"
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button onClick={handleExport} title="Exportar a Excel">
                <DownloadIcon className="h-4 w-4 mr-2" />
                <span>Exportar</span>
              </Button>
            </div>
          </div>

          <DataTable
            columns={bookingsColumns}
            data={filteredBookings}
            showSearch={false}
          />
        </CardContent>
      </Card>

      <FilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        filters={advancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
        onResetFilters={resetFilters}
        priceRange={priceRange}
      />
    </div>
  );
}
