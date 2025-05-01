"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
interface BookingsDataTableProps {
  userId: string;
}

export function BookingsDataTable({ userId }: BookingsDataTableProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [openProductSelect, setOpenProductSelect] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookingsData, setBookingsData] = useState<any[]>([]);

  // Fetch products for the user
  const { data: products, error: productsError } = useGetProductsByUserIdQuery(
    userId,
    {
      skip: !userId,
    }
  );

  // Fetch bookings for the selected product
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    error: bookingsError,
  } = useGetBookingsByUserIdProductIdQuery(
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

        "Fecha de reserva": moment(booking.createdAt).format("dddd, D [de] MMMM - h:mm A"),
        Total: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number.parseFloat(booking.total.toString())),
      };
    });

    exportToExcel(dataToExport, "Bookings");
  };

  // Handle error states
  if (productsError) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            There was an error loading your products. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle no products
  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You dont have any products yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
          ) : bookingsError ? (
            <div className="text-red-500">
              <p>
                There was an error loading bookings. Please try again later.
              </p>
            </div>
          ) : !bookingsData || bookingsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No bookings found for this product.</p>
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
