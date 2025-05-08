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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookingsData, setBookingsData] = useState<any[]>([]);

  // Fetch products for the user
  const { data: products, isLoading } = useGetProductsByUserIdQuery(userId, {
    skip: !userId,
  });

  // Fetch bookings for the selected product
  const { data: bookings, isLoading: isLoadingBookings } =
    useGetBookingsByUserIdProductIdQuery(
      { userId, productId: selectedProductId },
      { skip: !selectedProductId }
    );

  // Set the first product as selected when products load
  useEffect(() => {
    if (products && products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Update bookings data when bookings load
  useEffect(() => {
    if (bookings) {
      setBookingsData(bookings);
    }
  }, [bookings]);

  // Handle product selection
  const handleProductChange = useCallback((productId: string) => {
    setSelectedProductId(productId);
  }, []);

  // Export to Excel
  const handleExport = () => {
    const dataToExport = bookingsData.map((booking) => {
      return {
        ID: booking.bookingId,
        User: booking.user.username,
        Email: booking.user.email,
        Product: booking.name,
        Status: booking.status,
        Tickets: booking.tickets,
        Fecha: moment(booking.bookingDate).format("dddd, D [de] MMMM - h:mm A"),

        "Fecha de reserva": moment(booking.createdAt).format(
          "dddd, D [de] MMMM - h:mm A"
        ),
        Total: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number.parseFloat(booking.total.toString())),
      };
    });

    exportToExcel(dataToExport, "Bookings");
  };

  if (isLoading || isLoadingBookings || !products || !user) {
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
                    {selectedProductId
                      ? products.find(
                          (product) => product.id === selectedProductId
                        )?.name
                      : "Select a product..."}
                    <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search product..." />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-y-auto">
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.id}
                            onSelect={() => {
                              handleProductChange(product.id);
                              setOpenProductSelect(false);
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
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button onClick={handleExport} title="Exportar a Excel">
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
              data={bookingsData}
              showSearch={true}
              searchPlaceholder="Search bookings..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
