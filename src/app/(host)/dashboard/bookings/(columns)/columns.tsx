"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HostBooking } from "@/types/booking";
import type { ChecklistType } from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { ContractCell } from "../(components)/contract-cell";
import { statusColors } from "@/utils/data";
import moment from "moment";
import "moment/locale/es";

export function getBookingsColumns(
  t: (key: string) => string,
  language: string,
  tableKind: "tours" | "rental",
  onOpenChecklist?: (bookingId: string, contractId: string, type: ChecklistType) => void,
  onOpenDetails?: (booking: HostBooking) => void,
): ColumnDef<HostBooking>[] {
  const locale = language === "en" ? "en" : "es";
  const dateFormat = language === "es" ? "DD/MM/YYYY h:mm A" : "MM/DD/YYYY h:mm A";

  const columns: ColumnDef<HostBooking>[] = [
    {
      accessorKey: "user",
      size: 150,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("dashboard.bookings.table.client")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.getValue("user") as HostBooking["user"];
        const displayName =
          user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`.trim()
            : user?.username ?? "";
        return <div className="font-medium max-w-[140px] truncate" title={displayName}>{displayName || "—"}</div>;
      },
    },
  ];

  if (tableKind === "tours") {
    columns.push({
      accessorKey: "tickets",
      size: 80,
      header: ({ column }) => {
        return (
          <div className="text-end">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t("dashboard.bookings.table.tickets")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const tickets = row.getValue("tickets") as number | null;
        return <div className="text-center">{tickets ?? "—"}</div>;
      },
    });
  }

  columns.push({
    accessorKey: "total",
    size: 90,
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("dashboard.bookings.table.total")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const total = row.getValue("total") as string;
      return <div className="text-right font-medium">${total}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const totalA = Number.parseFloat(rowA.getValue("total") as string);
      const totalB = Number.parseFloat(rowB.getValue("total") as string);
      return totalA - totalB;
    },
  });

  if (tableKind === "tours") {
    columns.push({
      accessorKey: "tourDate",
      size: 200,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("dashboard.bookings.table.bookingDate")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("tourDate") as string;
        if (!date) return <div>—</div>;
        return (
          <div>
            {moment(date).locale(locale).format("dddd, D [de] MMMM - h:mm A")}
          </div>
        );
      },
      sortingFn: "datetime",
    });
  } else {
    columns.push(
      {
        accessorKey: "pickup_time",
        size: 155,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t("dashboard.bookings.table.pickupDate")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue("pickup_time") as string;
          if (!date) return <div>—</div>;
          return <div>{moment(date).locale(locale).format(dateFormat)}</div>;
        },
        sortingFn: "datetime",
      },
      {
        accessorKey: "dropoff_time",
        size: 155,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t("dashboard.bookings.table.dropoffDate")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue("dropoff_time") as string;
          if (!date) return <div>—</div>;
          return <div>{moment(date).locale(locale).format(dateFormat)}</div>;
        },
        sortingFn: "datetime",
      },
      {
        accessorKey: "pickup_location",
        size: 160,
        header: t("dashboard.bookings.table.pickupLocation"),
        cell: ({ row }) => {
          const loc = row.getValue("pickup_location") as string;
          return <div className="max-w-[200px] truncate" title={loc}>{loc || "—"}</div>;
        },
      },
    );
  }

  columns.push({
    accessorKey: "status",
    size: 120,
    header: t("dashboard.bookings.table.status"),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const label = t(`dashboard.bookings.status.${status}`);
      const display = label.startsWith("dashboard.") ? status : label;
      const statusKey =
        status === "completed" ? "completado"
        : status === "confirmed" ? "confirmado"
        : status === "cancelled" ? "cancelado"
        : status === "in-process" ? "pendiente"
        : "pendiente";
      const colorClass = statusColors[statusKey as keyof typeof statusColors] ?? "";
      return (
        <Badge variant="outline" className={`capitalize ${colorClass}`}>
          {display}
        </Badge>
      );
    },
  });

  if (tableKind === "rental" && onOpenDetails) {
    columns.push({
      id: "details",
      size: 90,
      header: () => <div className="text-center">{t("dashboard.bookings.table.details")}</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenDetails(row.original)}
          >
            <Eye className="mr-1 h-4 w-4" />
            {t("dashboard.bookings.table.details")}
          </Button>
        </div>
      ),
    });
  }

  if (tableKind === "rental" && onOpenChecklist) {
    columns.push({
      id: "contract",
      size: 185,
      header: () => <div className="text-center">Contrato</div>,
      meta: { stickyRight: true },
      cell: ({ row }) => (
        <ContractCell
          booking={row.original}
          onOpenChecklist={onOpenChecklist}
        />
      ),
    });
  }

  return columns;
}
