"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionCell } from "../(components)/action-cell";
import type { ITourProduct } from "@/types/product";
import moment from "moment";
import "moment/locale/es";
import { cn } from "@/lib/utils";

/** Max width shared by all product table cells (single line + ellipsis). */
const TABLE_CELL_MAX = "max-w-[120px] sm:max-w-[160px] min-w-0";
const TABLE_CELL_TRUNCATE = cn("font-medium truncate", TABLE_CELL_MAX);

export function getToursColumns(
  t: (key: string) => string,
  language: string,
  refetch?: () => void,
): ColumnDef<ITourProduct & { selectedDateId?: string }>[] {
  const locale = language === "en" ? "en" : "es";
  return [
    {
      accessorKey: "name",
      size: 140,
      minSize: 100,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("dashboard.products.table.name")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return (
          <div className={TABLE_CELL_TRUNCATE} title={name}>
            {name}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("dashboard.products.table.price")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const tour = row.original;
        const selectedDate = tour.tour?.tour_dates?.find(
          (date) => date.id === tour.selectedDateId,
        );
        const datePrice =
          typeof selectedDate?.price === "number"
            ? selectedDate.price
            : Number.parseFloat(String(selectedDate?.price ?? ""));
        const raw = row.getValue("price");
        const basePrice =
          typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? 0));
        const price = Number.isFinite(datePrice) ? datePrice : basePrice;
        const formatted = new Intl.NumberFormat("es-SV", {
          style: "currency",
          currency: "USD",
        }).format(Number.isFinite(price) ? price : 0);
        return (
          <div className={TABLE_CELL_TRUNCATE} title={formatted}>
            {formatted}
          </div>
        );
      },
    },
    {
      id: "current_date",
      header: t("dashboard.products.table.date"),
      cell: ({ row }) => {
        const tour = row.original;
        const selectedDateId = tour.selectedDateId;

        const tourDates = tour.tour?.tour_dates ?? [];
        const na = t("dashboard.products.table.notAvailable");
        if (!selectedDateId || tourDates.length === 0) {
          return (
            <div className={TABLE_CELL_TRUNCATE} title={na}>
              {na}
            </div>
          );
        }

        const selectedDate = tourDates.find(
          (date) => date.id === selectedDateId,
        );

        if (!selectedDate) {
          return (
            <div className={TABLE_CELL_TRUNCATE} title={na}>
              {na}
            </div>
          );
        }

        const dateStr = moment(selectedDate.date)
          .locale(locale)
          .format("dddd, D [de] MMMM - h:mm A");
        return (
          <div className={TABLE_CELL_TRUNCATE} title={dateStr}>
            {dateStr}
          </div>
        );
      },
    },
    {
      id: "date_availability",
      header: t("dashboard.products.table.availability"),
      cell: ({ row }) => {
        const tour = row.original;
        const selectedDateId = tour.selectedDateId;
        const tourDates = tour.tour?.tour_dates ?? [];
        const selectedDate =
          selectedDateId && tourDates.length > 0
            ? tourDates.find((d) => d.id === selectedDateId)
            : undefined;
        const ds = selectedDate?.status;
        if (ds) {
          const variant =
            ds === "active"
              ? "outline"
              : ds === "cancelled"
                ? "destructive"
                : "secondary";
          const label = t(`dashboard.products.table.dateStatus.${ds}`);
          return (
            <div className={TABLE_CELL_MAX}>
              <Badge
                variant={variant}
                className={cn(
                  "max-w-full truncate",
                  ds === "active" &&
                    "text-green-700 border-green-200 dark:text-green-400 dark:border-green-800",
                )}
                title={label}
              >
                {label}
              </Badge>
            </div>
          );
        }
        const isActive = row.getValue("is_active") as boolean | undefined;
        const visLabel = isActive
          ? t("dashboard.products.table.visible")
          : t("dashboard.products.table.hidden");
        return (
          <div className={TABLE_CELL_MAX}>
            <Badge
              variant={isActive ? "outline" : "destructive"}
              className={cn(
                "max-w-full truncate",
                isActive &&
                  "text-green-700 border-green-200 dark:text-green-400 dark:border-green-800",
              )}
              title={visLabel}
            >
              {visLabel}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "is_approved",
      header: t("dashboard.products.table.status"),
      cell: ({ row }) => {
        const isApproved = row.getValue("is_approved") as boolean;
        const statusLabel = isApproved
          ? t("dashboard.products.table.approved")
          : t("dashboard.products.table.pending");
        return (
          <div className={TABLE_CELL_MAX}>
            <Badge
              variant={isApproved ? "outline" : "destructive"}
              className={cn(
                "max-w-full truncate",
                isApproved &&
                  "text-green-700 border-green-200 dark:text-green-400 dark:border-green-800",
              )}
              title={statusLabel}
            >
              {statusLabel}
            </Badge>
          </div>
        );
      },
    },

    {
      id: "available_spots",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("dashboard.products.table.availableSpots")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const tour = row.original;
        const selectedDateId = tour.selectedDateId;

        const tourDatesSpots = tour.tour?.tour_dates ?? [];
        if (!selectedDateId || tourDatesSpots.length === 0) {
          return (
            <div className={cn("text-center", TABLE_CELL_TRUNCATE)} title="0">
              0
            </div>
          );
        }

        const selectedDate = tourDatesSpots.find(
          (date) => date.id === selectedDateId,
        );

        if (!selectedDate) {
          return (
            <div className={cn("text-center", TABLE_CELL_TRUNCATE)} title="0">
              0
            </div>
          );
        }

        const availableSpots =
          selectedDate.max_people - selectedDate.people_booked;
        const spotsStr = String(availableSpots);
        return (
          <div
            className={cn("text-center", TABLE_CELL_TRUNCATE)}
            title={spotsStr}
          >
            {availableSpots}
          </div>
        );
      },
    },
    {
      id: "people_booked",
      header: t("dashboard.products.table.bookings"),
      cell: ({ row }) => {
        const tour = row.original;
        const selectedDateId = tour.selectedDateId;

        const tourDatesBooked = tour.tour?.tour_dates ?? [];
        if (!selectedDateId || tourDatesBooked.length === 0) {
          return (
            <div className={cn("text-center", TABLE_CELL_TRUNCATE)} title="0">
              0
            </div>
          );
        }

        const selectedDate = tourDatesBooked.find(
          (date) => date.id === selectedDateId,
        );

        if (!selectedDate) {
          return (
            <div className={cn("text-center", TABLE_CELL_TRUNCATE)} title="0">
              0
            </div>
          );
        }

        const n = String(selectedDate.people_booked);
        return (
          <div className={cn("text-center", TABLE_CELL_TRUNCATE)} title={n}>
            {selectedDate.people_booked}
          </div>
        );
      },
    },
    {
      id: "departure_point",
      header: t("dashboard.products.table.departurePoint"),
      cell: ({ row }) => {
        const tour = row.original;
        const text =
          tour.tour?.departure_point ||
          t("dashboard.products.table.notSpecified");
        return (
          <div className={TABLE_CELL_TRUNCATE} title={text}>
            {text}
          </div>
        );
      },
    },
    {
      id: "max_people",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("dashboard.products.table.maxPeople")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const tour = row.original;
        const selectedDateId = tour.selectedDateId;

        const tourDatesMax = tour.tour?.tour_dates ?? [];
        if (!selectedDateId || tourDatesMax.length === 0) {
          return (
            <div className={cn("text-center", TABLE_CELL_TRUNCATE)} title="0">
              0
            </div>
          );
        }

        const selectedDate = tourDatesMax.find(
          (date) => date.id === selectedDateId,
        );

        if (!selectedDate) {
          return (
            <div className={cn("text-center", TABLE_CELL_TRUNCATE)} title="0">
              0
            </div>
          );
        }

        const n = String(selectedDate.max_people);
        return (
          <div className={cn("text-center", TABLE_CELL_TRUNCATE)} title={n}>
            {selectedDate.max_people}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("dashboard.products.table.actions"),
      meta: { stickyRight: true },
      cell: ({ row }) => {
        return (
          <ActionCell
            tour={row.original}
            selectedDateId={row.original.selectedDateId}
            onDeleted={refetch}
          />
        );
      },
    },
  ];
}
