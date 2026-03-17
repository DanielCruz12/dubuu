"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionCell } from "../(components)/action-cell";
import type { ITourProduct } from "@/types/product";
import moment from "moment";
import "moment/locale/es";

export function getToursColumns(
  t: (key: string) => string,
  language: string,
  refetch?: () => void
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
        <div
          className="font-medium max-w-[120px] sm:max-w-[160px] truncate"
          title={name}
        >
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
      const price = Number.parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return <div>{formatted}</div>;
    },
  },
  {
    id: "current_date",
    header: t("dashboard.products.table.date"),
    cell: ({ row }) => {
      const tour = row.original;
      const selectedDateId = tour.selectedDateId;

      const tourDates = tour.tour?.tour_dates ?? [];
      if (!selectedDateId || tourDates.length === 0) {
        return <div>{t("dashboard.products.table.notAvailable")}</div>;
      }

      const selectedDate = tourDates.find(
        (date) => date.id === selectedDateId
      );

      if (!selectedDate) {
        return <div>{t("dashboard.products.table.notAvailable")}</div>;
      }

      return (
        <div>
          {moment(selectedDate.date).locale(locale).format("dddd, D [de] MMMM - h:mm A")}
        </div>
      );
    },
  },
  {
    id: "departure_point",
    header: t("dashboard.products.table.departurePoint"),
    cell: ({ row }) => {
      const tour = row.original;
      return (
        <div>
          {tour.tour?.departure_point ||
            t("dashboard.products.table.notSpecified")}
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
        return <div className="text-center">0</div>;
      }

      const selectedDate = tourDatesMax.find(
        (date) => date.id === selectedDateId
      );

      if (!selectedDate) {
        return <div className="text-center">0</div>;
      }

      return <div className="text-center">{selectedDate.max_people}</div>;
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
        return <div className="text-center">0</div>;
      }

      const selectedDate = tourDatesBooked.find(
        (date) => date.id === selectedDateId
      );

      if (!selectedDate) {
        return <div className="text-center">0</div>;
      }

      return <div className="text-center">{selectedDate.people_booked}</div>;
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
        return <div className="text-center">0</div>;
      }

      const selectedDate = tourDatesSpots.find(
        (date) => date.id === selectedDateId
      );

      if (!selectedDate) {
        return <div className="text-center">0</div>;
      }

      const availableSpots =
        selectedDate.max_people - selectedDate.people_booked;
      return <div className="text-center">{availableSpots}</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: t("dashboard.products.table.availability"),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive
              ? t("dashboard.products.table.visible")
              : t("dashboard.products.table.hidden")}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "is_approved",
    header: t("dashboard.products.table.status"),
    cell: ({ row }) => {
      const isActive = row.getValue("is_approved") as boolean;
      return (
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive
              ? t("dashboard.products.table.approved")
              : t("dashboard.products.table.pending")}
          </Badge>
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
