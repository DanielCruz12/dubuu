/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon, SearchIcon } from "lucide-react";
import { exportToExcel } from "@/lib/excelFn";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingCard } from "./booking-card";
import type { HostBooking } from "@/types/booking";
import type { ChecklistType } from "@/types/contract";
import { ContractChecklistDrawer } from "../../(components)/contract-checklist-drawer";
import { BookingDetailsModal } from "../../(components)/booking-details-modal";
import moment from "moment";
import "moment/locale/es";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/lib/i18n-context";
import { isProductType } from "@/utils";
import { ProductTypeKey, productTypeKeyToFormKind, formKindToProductTypeKey, type ProductFormKind } from "@/constants/product-type";

const STORAGE_KEY = "dashboard-table-kind";

function readTableKind(): ProductFormKind {
  if (typeof window === "undefined") return productTypeKeyToFormKind(ProductTypeKey.TOUR);
  return window.localStorage.getItem(STORAGE_KEY) === ProductTypeKey.RENTAL
    ? productTypeKeyToFormKind(ProductTypeKey.RENTAL)
    : productTypeKeyToFormKind(ProductTypeKey.TOUR);
}

export function BookingsDataTable() {
  const { user } = useUser();
  const userId = user?.id as string;

  const [tableKind, setTableKind] = useState<ProductFormKind>(readTableKind);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [openProductSelect, setOpenProductSelect] = useState(false);
  const [bookingsData, setBookingsData] = useState<HostBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Checklist drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContractId, setDrawerContractId] = useState("");
  const [drawerType, setDrawerType] = useState<ChecklistType>("OUT");

  // Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsBooking, setDetailsBooking] = useState<HostBooking | null>(null);

  const handleOpenChecklist = useCallback(
    (_bookingId: string, contractId: string, type: ChecklistType) => {
      setDrawerContractId(contractId);
      setDrawerType(type);
      setDrawerOpen(true);
    },
    [],
  );

  const handleOpenDetails = useCallback((booking: HostBooking) => {
    setDetailsBooking(booking);
    setDetailsOpen(true);
  }, []);

  const { t, language } = useLanguage();

  // Fetch products for the user
  const { data: products, isLoading } = useGetProductsByUserIdQuery(userId, {
    skip: !userId,
  });

  // Filter products by selected type
  const productsByType = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => isProductType(p, tableKind));
  }, [products, tableKind]);

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

  // Set the first product as selected when products load or type changes
  useEffect(() => {
    if (productsByType.length > 0) {
      setFilteredProducts(productsByType);
      const isCurrentValid = productsByType.some((p) => p.id === selectedProductId);
      if (!isCurrentValid) {
        setSelectedProductId(productsByType[0].id);
      }
    } else {
      setFilteredProducts([]);
      setSelectedProductId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsByType]);

  // Update bookingsData when bookings change or when there's an error
  useEffect(() => {
    if (bookingsError) {
      // Si hay un error (como 404), establecemos un array vacío
      setBookingsData([]);
    } else if (bookings) {
      // Sort from most recent to oldest
      const sorted = [...bookings].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setBookingsData(sorted);
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

      if (!value.trim()) {
        setFilteredProducts(productsByType);
        return;
      }

      const lowercaseSearch = value.toLowerCase();
      const filtered = productsByType.filter((product) =>
        product.name.toLowerCase().includes(lowercaseSearch)
      );

      setFilteredProducts(filtered);
    },
    [productsByType]
  );

  // Export to Excel
  const handleExport = () => {
    if (!bookingsData || bookingsData.length === 0) {
      return;
    }

    const currencyFormat = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    const dataToExport = bookingsData.map((booking) => {
      const u = booking.user;
      const fullName =
        u?.first_name && u?.last_name
          ? `${u.first_name} ${u.last_name}`.trim()
          : u?.username ?? "";

      if (tableKind === "rental") {
        return {
          ID: booking.bookingId,
          [t("dashboard.bookings.table.client")]: fullName,
          [t("dashboard.products.filters.product")]: booking.name,
          [t("dashboard.bookings.table.status")]: booking.status,
          [t("dashboard.bookings.table.pickupDate")]: booking.pickup_time
            ? moment(booking.pickup_time).format("DD/MM/YYYY h:mm A")
            : "",
          [t("dashboard.bookings.table.dropoffDate")]: booking.dropoff_time
            ? moment(booking.dropoff_time).format("DD/MM/YYYY h:mm A")
            : "",
          [t("dashboard.bookings.table.pickupLocation")]: booking.pickup_location ?? "",
          [t("dashboard.bookings.table.total")]: currencyFormat.format(
            Number.parseFloat(booking.total)
          ),
        };
      }

      const tourDate = booking.tourDate;
      const tourDateFormatted = tourDate
        ? moment(tourDate).format("dddd, D [de] MMMM - h:mm A")
        : "";
      return {
        ID: booking.bookingId,
        [t("dashboard.bookings.table.client")]: fullName,
        [t("dashboard.products.filters.product")]: booking.name,
        [t("dashboard.bookings.table.status")]: booking.status,
        [t("dashboard.bookings.table.tickets")]: booking.tickets,
        [t("dashboard.bookings.table.bookingDate")]: tourDateFormatted,
        [t("dashboard.bookings.table.total")]: currencyFormat.format(
          Number.parseFloat(booking.total)
        ),
      };
    });

    exportToExcel(dataToExport, t("dashboard.bookings.exportSheetName"));
  };

  // Dirección del producto de la reserva en detalle (para el link de Google Maps)
  const detailsProduct = detailsBooking
    ? products?.find((p) => p.id === detailsBooking.productId)
    : undefined;
  const detailsTourAddress = detailsProduct
    ? `${detailsProduct.address}, ${detailsProduct.country}`
    : undefined;

  // Solo mostrar skeleton mientras carga los productos iniciales
  if (isLoading || !products || !user) {
    return (
      <div className="space-y-4 pt-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="w-full max-w-xs">
              <label className="text-sm font-medium mb-1 block">
                {t("dashboard.bookings.filters.listKind")}
              </label>
              <Select
                value={tableKind}
                onValueChange={(v) => { const k = v as ProductFormKind; setTableKind(k); localStorage.setItem(STORAGE_KEY, formKindToProductTypeKey(k)); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tours">{t("dashboard.bookings.filters.kindTours")}</SelectItem>
                  <SelectItem value="rental">{t("dashboard.bookings.filters.kindRental")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
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
                        ? productsByType.find(
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
              {bookingsData && bookingsData.length > 0 && (
                <Button
                  onClick={handleExport}
                  title={t("dashboard.bookings.filters.export")}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  <span>{t("dashboard.bookings.filters.export")}</span>
                </Button>
              )}
            </div>
          </div>
          </div>

          {isLoadingBookings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookingsData && bookingsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookingsData.map((booking) => (
                <BookingCard
                  key={booking.bookingId}
                  booking={booking}
                  tableKind={tableKind}
                  t={t}
                  language={language}
                  onOpenChecklist={handleOpenChecklist}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-sm">
                {selectedProductId
                  ? t("dashboard.dataTable.noResults")
                  : t("dashboard.bookings.filters.selectProduct")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ContractChecklistDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        contractId={drawerContractId}
        type={drawerType}
      />

      <BookingDetailsModal
        booking={detailsBooking}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        tourAddress={detailsTourAddress}
      />
    </div>
  );
}
