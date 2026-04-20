"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, PlusCircle, SearchIcon } from "lucide-react";
import { getToursColumns } from "../(columns)/columns";
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
import { DataTableSkeleton } from "@/components/skeletons/datatable-skeleton";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import moment from "moment";
import "moment/locale/es";

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

export function ProductsDataTable() {
  const { user } = useUser();
  const [selectedTourId, setSelectedTourId] = useState<string>("");
  const [selectedDateId, setSelectedDateId] = useState<string>("");
  const [filteredTours, setFilteredTours] = useState<
    (ITourProduct & { selectedDateId?: string })[]
  >([]);
  const [availableTours, setAvailableTours] = useState<ITourProduct[]>([]);
  const [openTourSelect, setOpenTourSelect] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { t, language } = useLanguage();
  const { data, isLoading, refetch } = useGetProductsByUserIdQuery(user?.id as string, {
    skip: !user?.id,
  });

  const columns = useMemo(
    () => getToursColumns(t, language, refetch),
    [t, language, refetch]
  );

  // Obtener fechas disponibles para el tour seleccionado
  const availableDates = useMemo(() => {
    if (!selectedTourId) return [];
    const selectedTour = availableTours.find(
      (tour) => tour.id === selectedTourId
    );
    return selectedTour?.tour?.tour_dates ?? [];
  }, [selectedTourId, availableTours]);

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableTours;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    return availableTours.filter((tour) =>
      tour.name.toLowerCase().includes(lowercaseSearch)
    );
  }, [availableTours, searchTerm]);

  // Manejar el cambio de producto seleccionado
  const handleTourChange = useCallback(
    (tourId: string) => {
      setSelectedTourId(tourId);

      // Encontrar el tour seleccionado
      const selectedTour = availableTours.find((tour) => tour.id === tourId);

      // Establecer la primera fecha como predeterminada si está disponible
      const dates = selectedTour?.tour?.tour_dates ?? [];
      if (selectedTour && dates.length > 0) {
        setSelectedDateId(dates[0].id);
      } else {
        setSelectedDateId("");
      }
    },
    [availableTours]
  );

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

    // Seleccionar automáticamente el primer tour y su primera fecha, o limpiar si no hay productos
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

  // Actualizar los tours filtrados cuando cambian los criterios de filtrado
  useEffect(() => {
    if (!availableTours.length) {
      setFilteredTours([]);
      return;
    }

    let filtered = availableTours;

    // Si hay un tour seleccionado, filtrar solo ese tour
    if (selectedTourId) {
      filtered = filtered.filter((product) => product.id === selectedTourId);
    }

    // Añadir el selectedDateId a cada tour para que las columnas puedan acceder a él
    const toursWithSelectedDate = filtered.map((tour) => {
      const tourDates = tour.tour?.tour_dates ?? [];
      // Verificar que el selectedDateId pertenezca a este tour
      const dateExists = tourDates.some(
        (date) => date.id === selectedDateId
      );

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

  const handleExport = () => {
    const dataToExport = filteredTours.map((tour) =>
      buildTourProductExcelRow(tour, t, language),
    );

    exportToExcel(dataToExport, t("dashboard.products.title"), {
      sheetName: t("dashboard.products.exportWorksheet"),
    });
  };

  if (isLoading || !user) {
    return (
      <DataTableSkeleton
        headers={[
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
                        ? availableTours.find(
                            (tour) => tour.id === selectedTourId
                          )?.name
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
                    <SelectValue
                      placeholder={t("dashboard.products.filters.selectDate")}
                    />
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
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{t("dashboard.products.filters.export")}</span>
                </Button>
              )}

              <Button asChild className="flex items-center gap-2">
                <Link href="/dashboard/products/add">
                  <PlusCircle className="h-4 w-4" />
                  <span>{t("dashboard.products.filters.newTour")}</span>
                </Link>
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredTours}
            showSearch={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
