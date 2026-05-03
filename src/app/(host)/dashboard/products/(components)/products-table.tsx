"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2, PlusCircle, SearchIcon } from "lucide-react";
import { getToursColumns } from "../(columns)/columns";
import { getRentalColumns } from "../(columns)/rental-columns";
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
import { useGetProductTypesQuery } from "@/redux/slices/product/product-types";
import { isProductType, productTypeNameToFormKind } from "@/utils";
import type { IProduct, ITourProduct } from "@/types/product";
import type { IRentalProduct } from "@/types/rental";
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
import { DataTableSkeleton } from "@/components/skeletons/datatable-skeleton";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import moment from "moment";
import "moment/locale/es";
import { Input } from "@/components/ui/input";

type ProductTableKind = "tours" | "rental";

function buildTourProductExcelRow(
  tour: ITourProduct & { selectedDateId?: string },
  t: (key: string) => string,
  language: string,
): Record<string, string | number> {
  const locale = language === "en" ? "en" : "es";
  const numberLocale = language === "en" ? "en-US" : "es-SV";
  const tourDates = tour.tour?.tour_dates ?? [];
  const selectedDate = tourDates.find((d) => d.id === tour.selectedDateId);

  const datePrice =
    typeof selectedDate?.price === "number"
      ? selectedDate.price
      : Number.parseFloat(String(selectedDate?.price ?? ""));
  const basePrice =
    typeof tour.price === "number"
      ? tour.price
      : Number.parseFloat(String(tour.price ?? 0));
  const priceNum = Number.isFinite(datePrice) ? datePrice : basePrice;
  const formattedPrice = new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(priceNum) ? priceNum : 0);

  const dateFormat =
    language === "en"
      ? "dddd, MMMM D, YYYY - h:mm A"
      : "dddd, D [de] MMMM - h:mm A";
  const dateStr =
    selectedDate?.date != null
      ? moment(selectedDate.date).locale(locale).format(dateFormat)
      : "";

  const ds = selectedDate?.status;
  let availabilityLabel: string;
  if (ds) {
    availabilityLabel = t(`dashboard.products.table.dateStatus.${ds}`);
  } else {
    availabilityLabel = tour.is_active
      ? t("dashboard.products.table.visible")
      : t("dashboard.products.table.hidden");
  }

  const approvalLabel = tour.is_approved
    ? t("dashboard.products.table.approved")
    : t("dashboard.products.table.pending");

  const availableSpots =
    selectedDate != null
      ? selectedDate.max_people - selectedDate.people_booked
      : "";

  const columnsInTableOrder: [string, string | number][] = [
    [t("dashboard.products.table.name"), tour.name],
    [t("dashboard.products.table.price"), formattedPrice],
    [t("dashboard.products.table.date"), dateStr],
    [t("dashboard.products.table.availability"), availabilityLabel],
    [t("dashboard.products.table.status"), approvalLabel],
    [t("dashboard.products.table.availableSpots"), availableSpots],
    [t("dashboard.products.table.bookings"), selectedDate?.people_booked ?? ""],
    [
      t("dashboard.products.table.departurePoint"),
      tour.tour?.departure_point ?? "",
    ],
    [t("dashboard.products.table.maxPeople"), selectedDate?.max_people ?? ""],
    [t("dashboard.products.table.id"), tour.id],
    [t("dashboard.products.table.description"), tour.description ?? ""],
    [t("dashboard.products.table.country"), tour.country ?? ""],
    [t("dashboard.products.table.address"), tour.address ?? ""],
  ];

  return Object.fromEntries(columnsInTableOrder);
}

function buildRentalExcelRow(
  r: IRentalProduct,
  t: (key: string) => string,
  language: string,
): Record<string, string | number> {
  const numberLocale = language === "en" ? "en-US" : "es-SV";
  const day = r.rental?.price_per_day;
  const n = day != null ? Number.parseFloat(String(day)) : Number(r.price);
  const formattedPrice = new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(n) ? n : 0);

  const ren = r.rental;
  const columnsInTableOrder: [string, string | number][] = [
    [t("dashboard.products.rentalTable.name"), r.name],
    [t("dashboard.products.rentalTable.brand"), ren?.brand ?? ""],
    [t("dashboard.products.rentalTable.model"), ren?.model ?? ""],
    [t("dashboard.products.rentalTable.year"), ren?.year != null ? String(ren.year) : ""],
    [t("dashboard.products.rentalTable.pricePerDay"), formattedPrice],
    [t("dashboard.products.rentalTable.listing"), r.is_active ? t("dashboard.products.table.visible") : t("dashboard.products.table.hidden")],
    [t("dashboard.products.table.status"), r.is_approved ? t("dashboard.products.table.approved") : t("dashboard.products.table.pending")],
    [t("dashboard.products.table.id"), r.id],
  ];

  return Object.fromEntries(columnsInTableOrder);
}

export function ProductsDataTable() {
  const { user } = useUser();
  const [tableKind, setTableKind] = useState<ProductTableKind>("tours");
  const [selectedTourId, setSelectedTourId] = useState<string>("");
  const [selectedDateId, setSelectedDateId] = useState<string>("");
  const [filteredTours, setFilteredTours] = useState<
    (ITourProduct & { selectedDateId?: string })[]
  >([]);
  const [availableTours, setAvailableTours] = useState<ITourProduct[]>([]);
  const [availableRentals, setAvailableRentals] = useState<IRentalProduct[]>([]);
  const [openTourSelect, setOpenTourSelect] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rentalSearchTerm, setRentalSearchTerm] = useState("");
  const { t, language } = useLanguage();
  const { data, isLoading, refetch } = useGetProductsByUserIdQuery(user?.id as string, {
    skip: !user?.id,
  });

  const { data: productTypes = [], isLoading: isLoadingProductTypes } = useGetProductTypesQuery();

  /** Product type UUID from API for the list filter (tours vs rental). */
  const productTypeIdForAdd = useMemo(() => {
    return productTypes.find((pt) => productTypeNameToFormKind(pt.name) === tableKind)?.id;
  }, [productTypes, tableKind]);

  const tourColumns = useMemo(
    () => getToursColumns(t, language, refetch),
    [t, language, refetch],
  );

  const rentalColumns = useMemo(() => getRentalColumns(t, refetch), [t, refetch]);

  const filteredRentals = useMemo(() => {
    const q = rentalSearchTerm.trim().toLowerCase();
    if (!q) return availableRentals;
    return availableRentals.filter((p) => p.name.toLowerCase().includes(q));
  }, [availableRentals, rentalSearchTerm]);

  const availableDates = useMemo(() => {
    if (!selectedTourId) return [];
    const selectedTour = availableTours.find((tour) => tour.id === selectedTourId);
    return selectedTour?.tour?.tour_dates ?? [];
  }, [selectedTourId, availableTours]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableTours;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    return availableTours.filter((tour) =>
      tour.name.toLowerCase().includes(lowercaseSearch),
    );
  }, [availableTours, searchTerm]);

  const handleTourChange = useCallback(
    (tourId: string) => {
      setSelectedTourId(tourId);

      const selectedTour = availableTours.find((tour) => tour.id === tourId);

      const dates = selectedTour?.tour?.tour_dates ?? [];
      if (selectedTour && dates.length > 0) {
        setSelectedDateId(dates[0].id);
      } else {
        setSelectedDateId("");
      }
    },
    [availableTours],
  );

  useEffect(() => {
    if (!data) return;

    const tourProducts: ITourProduct[] = [];
    const rentalProducts: IRentalProduct[] = [];

    data.forEach((product: IProduct) => {
      if (isProductType(product, "tours")) {
        tourProducts.push(product);
      } else if (isProductType(product, "rental")) {
        rentalProducts.push(product);
      }
    });

    setAvailableTours(tourProducts);
    setAvailableRentals(rentalProducts);

    if (tourProducts.length > 0) {
      const firstTour = tourProducts[0];
      setSelectedTourId(firstTour.id);

      const firstTourDates = firstTour.tour?.tour_dates ?? [];
      if (firstTourDates.length > 0) {
        setSelectedDateId(firstTourDates[0].id);
      }
    } else {
      setSelectedTourId("");
      setSelectedDateId("");
    }
  }, [data]);

  useEffect(() => {
    if (!availableTours.length) {
      setFilteredTours([]);
      return;
    }

    let filtered = availableTours;

    if (selectedTourId) {
      filtered = filtered.filter((product) => product.id === selectedTourId);
    }

    const toursWithSelectedDate = filtered.map((tour) => {
      const tourDates = tour.tour?.tour_dates ?? [];
      const dateExists = tourDates.some((date) => date.id === selectedDateId);

      return {
        ...tour,
        selectedDateId: dateExists
          ? selectedDateId
          : tourDates.length > 0
            ? tourDates[0].id
            : undefined,
      };
    });

    setFilteredTours(toursWithSelectedDate);
  }, [selectedTourId, selectedDateId, availableTours]);

  const handleExportTours = () => {
    const dataToExport = filteredTours.map((tour) =>
      buildTourProductExcelRow(tour, t, language),
    );

    exportToExcel(dataToExport, t("dashboard.products.title"), {
      sheetName: t("dashboard.products.exportWorksheet"),
    });
  };

  const handleExportRentals = () => {
    const dataToExport = filteredRentals.map((row) =>
      buildRentalExcelRow(row, t, language),
    );
    exportToExcel(dataToExport, t("dashboard.products.rentalExportTitle"), {
      sheetName: t("dashboard.products.exportWorksheet"),
    });
  };

  if (isLoading || !user) {
    return (
      <DataTableSkeleton
        headers={
          tableKind === "tours"
            ? [
                t("dashboard.products.table.name"),
                t("dashboard.products.table.price"),
                t("dashboard.products.table.date"),
                t("dashboard.products.table.availability"),
                t("dashboard.products.table.status"),
                t("dashboard.products.table.availableSpots"),
                t("dashboard.products.table.bookings"),
                t("dashboard.products.table.departurePoint"),
                t("dashboard.products.table.maxPeople"),
                t("dashboard.products.table.actions"),
              ]
            : [
                t("dashboard.products.rentalTable.name"),
                t("dashboard.products.rentalTable.brand"),
                t("dashboard.products.rentalTable.model"),
                t("dashboard.products.rentalTable.year"),
                t("dashboard.products.rentalTable.pricePerDay"),
                t("dashboard.products.table.status"),
                t("dashboard.products.rentalTable.listing"),
                t("dashboard.products.table.actions"),
              ]
        }
      />
    );
  }

  return (
    <div className="space-y-4 pt-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="w-full max-w-xs">
              <label className="text-sm font-medium mb-1 block">
                {t("dashboard.products.filters.listKind")}
              </label>
              <Select
                value={tableKind}
                onValueChange={(v) => setTableKind(v as ProductTableKind)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tours">{t("dashboard.products.filters.kindTours")}</SelectItem>
                  <SelectItem value="rental">{t("dashboard.products.filters.kindRental")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tableKind === "tours" ? (
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/3 min-w-0">
                  <label className="text-sm font-medium mb-1 block">
                    {t("dashboard.products.filters.product")}
                  </label>
                  <Popover open={openTourSelect} onOpenChange={setOpenTourSelect}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openTourSelect}
                        className="w-full justify-between min-w-0 text-left"
                      >
                        <span className="truncate">
                          {selectedTourId
                            ? availableTours.find((tour) => tour.id === selectedTourId)?.name
                            : t("dashboard.products.filters.selectProduct")}
                        </span>
                        <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                          placeholder={t("dashboard.products.filters.searchProduct")}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {t("dashboard.products.filters.noProductsFound")}
                          </CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {filteredProducts.map((tour) => (
                              <CommandItem
                                key={tour.id}
                                value={tour.name}
                                onSelect={() => {
                                  handleTourChange(tour.id);
                                  setOpenTourSelect(false);
                                  setSearchTerm("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedTourId === tour.id ? "opacity-100" : "opacity-0",
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

                <div className="w-full md:w-1/3 min-w-0">
                  <label className="text-sm font-medium mb-1 block">
                    {t("dashboard.products.filters.productDate")}
                  </label>
                  {!selectedTourId ? (
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                      {t("dashboard.products.filters.selectProductFirst")}
                    </div>
                  ) : (
                    <Select
                      value={selectedDateId}
                      onValueChange={setSelectedDateId}
                      disabled={availableDates.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("dashboard.products.filters.selectDate")} />
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
                            {t("dashboard.products.filters.noDates")}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {filteredTours.length > 0 && (
                    <Button
                      onClick={handleExportTours}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>{t("dashboard.products.filters.export")}</span>
                    </Button>
                  )}

                  {isLoadingProductTypes ? (
                    <Button type="button" disabled className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("dashboard.products.filters.addButton")}</span>
                    </Button>
                  ) : productTypeIdForAdd ? (
                    <Button asChild className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/products/add?type=${encodeURIComponent(productTypeIdForAdd)}`}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>{t("dashboard.products.filters.addButton")}</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled
                      className="flex items-center gap-2"
                      title={t("dashboard.products.filters.addDisabledNoProductType")}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>{t("dashboard.products.filters.addButton")}</span>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:flex-1 min-w-0">
                  <label className="text-sm font-medium mb-1 block">
                    {t("dashboard.products.filters.searchRental")}
                  </label>
                  <Input
                    value={rentalSearchTerm}
                    onChange={(e) => setRentalSearchTerm(e.target.value)}
                    placeholder={t("dashboard.products.filters.searchRentalPlaceholder")}
                  />
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  {filteredRentals.length > 0 && (
                    <Button
                      onClick={handleExportRentals}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>{t("dashboard.products.filters.export")}</span>
                    </Button>
                  )}
                  {isLoadingProductTypes ? (
                    <Button type="button" disabled className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("dashboard.products.filters.addButton")}</span>
                    </Button>
                  ) : productTypeIdForAdd ? (
                    <Button asChild className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/products/add?type=${encodeURIComponent(productTypeIdForAdd)}`}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>{t("dashboard.products.filters.addButton")}</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled
                      className="flex items-center gap-2"
                      title={t("dashboard.products.filters.addDisabledNoProductType")}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>{t("dashboard.products.filters.addButton")}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {tableKind === "tours" ? (
            <DataTable columns={tourColumns} data={filteredTours} showSearch={false} />
          ) : (
            <DataTable columns={rentalColumns} data={filteredRentals} showSearch={false} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
