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
import { useLanguage } from "@/lib/i18n-context";

export function BookingsDataTable() {
  const { user } = useUser();
  const userId = user?.id as string;

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [openProductSelect, setOpenProductSelect] = useState(false);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const { t } = useLanguage();

  // Fetch products for the user
  const { data: products, isLoading } = useGetProductsByUserIdQuery(userId, {
    skip: !userId,
  });

  // Fetch bookings for the selected product
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    error: bookingsError,
  } = useGetBookingsByUserIdProductIdQuery(
    { userId, productId: selectedProductId },
    {
      skip: !selectedProductId,
      refetchOnMountOrArgChange: true,
    }
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

  // Update bookingsData when bookings change or when there's an error
  useEffect(() => {
    if (bookingsError) {
      // Si hay un error (como 404), establecemos un array vacío
      setBookingsData([]);
    } else if (bookings) {
      // Si hay datos, los usamos
      setBookingsData(bookings);
    }
  }, [bookings, bookingsError]);

  // Handle product selection
  const handleProductChange = useCallback(
    (productId: string) => {
      // Solo actualizar si es un producto diferente
      if (productId !== selectedProductId) {
        setSelectedProductId(productId);
      }
    },
    [selectedProductId]
  );

  // Handle search in Command component
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

  // Export to Excel - Manteniendo la lógica original
  const handleExport = () => {
    if (!bookingsData || bookingsData.length === 0) {
      return;
    }

    const dataToExport = bookingsData.map((booking) => {
      const tourDate = booking.tourDate ?? booking.bookingDate;
      const tourDateFormatted = tourDate
        ? moment(tourDate).format("dddd, D [de] MMMM - h:mm A")
        : "";
      const u = booking.user;
      const fullName =
        u?.first_name && u?.last_name
          ? `${u.first_name} ${u.last_name}`.trim()
          : u?.username ?? "";
      return {
        ID: booking.bookingId,
        [t("dashboard.bookings.table.client")]: fullName,
        [t("dashboard.products.filters.product")]: booking.name,
        [t("dashboard.bookings.table.status")]: booking.status,
        [t("dashboard.bookings.table.tickets")]: booking.tickets,
        [t("dashboard.bookings.table.date")]: tourDateFormatted,
        [t("dashboard.bookings.table.bookingDate")]: tourDateFormatted,
        [t("dashboard.bookings.table.total")]: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number.parseFloat(booking.total.toString())),
      };
    });

    exportToExcel(dataToExport, t("dashboard.bookings.exportSheetName"));
  };

  // Solo mostrar skeleton mientras carga los productos iniciales
  if (isLoading || !products || !user) {
    return (
      <DataTableSkeleton
        headers={[
          t("dashboard.bookings.table.client"),
          t("dashboard.bookings.table.tickets"),
          t("dashboard.bookings.table.total"),
          t("dashboard.bookings.table.date"),
          t("dashboard.bookings.table.status"),
          t("dashboard.bookings.table.bookingDate"),
        ]}
      />
    );
  }

  return (
    <div className="space-y-4 pt-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="w-full md:w-1/3 min-w-0">
              <label className="text-sm font-medium mb-1 block">
                {t("dashboard.bookings.filters.product")}
              </label>
              <Popover
                open={openProductSelect}
                onOpenChange={setOpenProductSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProductSelect}
                    className="w-full justify-between min-w-0 text-left"
                  >
                    <span className="truncate">
                      {selectedProductId
                        ? products.find(
                            (product) => product.id === selectedProductId
                          )?.name
                        : t("dashboard.bookings.filters.selectProduct")}
                    </span>
                    <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={t(
                        "dashboard.bookings.filters.searchProduct"
                      )}
                      value={searchTerm}
                      onValueChange={handleCommandSearch}
                    />
                    <CommandList>
                      {filteredProducts.length === 0 ? (
                        <CommandEmpty>
                          {t("dashboard.bookings.filters.noProductsFound")}
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
                title={t("dashboard.bookings.filters.export")}
                disabled={!bookingsData || bookingsData.length === 0}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                <span>{t("dashboard.bookings.filters.export")}</span>
              </Button>
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <DataTable columns={bookingsColumns} data={bookingsData || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
