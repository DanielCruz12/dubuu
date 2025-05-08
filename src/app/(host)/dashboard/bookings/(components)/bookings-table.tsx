/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon, SearchIcon } from "lucide-react";
import { exportToExcel } from "@/lib/excelFn";
import { DataTable } from "@/components/data-table/datatable";
import { useGetProductsByUserIdQuery } from "@/redux/slices/product/product-slice";
import { useGetBookingsByUserIdProductIdQuery } from "@/redux/slices/booking/booking-slice";
import { Skeleton } from "@/components/ui/skeleton";
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
import { bookingsColumns } from "../(columns)/columns";
import moment from "moment";
import "moment/locale/es";
import { DataTableSkeleton } from "@/components/skeletons/datatable-skeleton";
import { useUser } from "@clerk/nextjs";

export function BookingsDataTable() {
  const { user } = useUser();
  const userId = user?.id as string;

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [openProductSelect, setOpenProductSelect] = useState(false);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Caché local para mantener los datos de bookings por producto
  const [bookingsCache, setBookingsCache] = useState<Record<string, any[]>>({});

  // Fetch products for the user
  const { data: products, isLoading } = useGetProductsByUserIdQuery(userId, {
    skip: !userId,
  });

  // Fetch bookings for the selected product
  const { data: bookings, isLoading: isLoadingBookings } =
    useGetBookingsByUserIdProductIdQuery(
      { userId, productId: selectedProductId },
      { skip: !selectedProductId || !userId }
    );

  // Set the first product as selected when products load
  useEffect(() => {
    if (products && products.length > 0) {
      setFilteredProducts(products);
      if (!selectedProductId) {
        setSelectedProductId(products[0].id);
      }
    }
  }, [products, selectedProductId]);

  // Update bookings data and cache when bookings load
  useEffect(() => {
    if (bookings && selectedProductId) {
      // Actualizar el caché local
      setBookingsCache((prev) => ({
        ...prev,
        [selectedProductId]: bookings,
      }));

      // Actualizar los datos mostrados
      setBookingsData(bookings);
    }
  }, [bookings, selectedProductId]);

  // Handle product selection
  const handleProductChange = useCallback(
    (productId: string) => {
      setSelectedProductId(productId);

      // Verificar si tenemos datos en caché para este producto
      if (bookingsCache[productId]) {
        // Usar datos del caché
        setBookingsData(bookingsCache[productId]);
      } else {
        // Limpiar datos mientras carga
        setBookingsData([]);
      }
    },
    [bookingsCache]
  );

  const handleCommandSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (!products) return;

      if (!value.trim()) {
        setFilteredProducts(products);
        return;
      }

      const lowercaseSearch = value.toLowerCase();
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(lowercaseSearch)
      );

      setFilteredProducts(filtered);
    },
    [products]
  );

  // Export to Excel
  const handleExport = () => {
    if (!bookingsData.length) return;

    const dataToExport = bookingsData.map((booking) => {
      return {
        ID: booking.bookingId,
        User: booking.user?.username || "N/A",
        Email: booking.user?.email || "N/A",
        Product: booking.name || "N/A",
        Status: booking.status || "N/A",
        Tickets: booking.tickets || 0,
        Fecha: booking.bookingDate
          ? moment(booking.bookingDate).format("dddd, D [de] MMMM - h:mm A")
          : "N/A",
        "Fecha de reserva": booking.createdAt
          ? moment(booking.createdAt).format("dddd, D [de] MMMM - h:mm A")
          : "N/A",
        Total: booking.total
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(Number.parseFloat(booking.total.toString()))
          : "$0.00",
      };
    });

    exportToExcel(dataToExport, "Bookings");
  };

  if (isLoading || !user) {
    return (
      <DataTableSkeleton
        headers={[
          "Cliente",
          "Boletos",
          "Total",
          "Fecha",
          "Estado",
          "Fecha de reserva",
        ]}
      />
    );
  }

  return (
    <div className="space-y-4 pt-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Producto</label>
              <Popover
                open={openProductSelect}
                onOpenChange={setOpenProductSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProductSelect}
                    className="w-full md:w-[300px] justify-between"
                  >
                    {selectedProductId && products
                      ? products.find(
                          (product) => product.id === selectedProductId
                        )?.name || "Seleccionar producto..."
                      : "Seleccionar producto..."}
                    <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar producto..."
                      value={searchTerm}
                      onValueChange={handleCommandSearch}
                    />
                    <CommandList>
                      {!filteredProducts || filteredProducts.length === 0 ? (
                        <CommandEmpty>
                          No hay productos que coincidan con la búsqueda.
                        </CommandEmpty>
                      ) : (
                        <CommandGroup className="max-h-64 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => {
                                handleProductChange(product.id);
                                setOpenProductSelect(false);
                                setSearchTerm("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProductId === product.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {product.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                onClick={handleExport}
                title="Exportar a Excel"
                disabled={!bookingsData.length}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                <span>Exportar</span>
              </Button>
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <DataTable
              columns={bookingsColumns}
              data={bookingsData || []}
              showSearch={true}
              searchPlaceholder="Buscar reservas..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
