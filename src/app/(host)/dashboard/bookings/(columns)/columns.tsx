"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking, IBooking } from "@/types/booking";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import "moment/locale/es";
// Define las columnas para la tabla de reservas
export const bookingsColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.getValue("user") as IBooking["user"];
      const displayName =
        user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`.trim()
          : user?.username ?? "";
      return <div className="font-medium">{displayName || "—"}</div>;
    },
  },
  {
    accessorKey: "tickets",
    header: ({ column }) => {
      return (
        <div className="text-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Boletos
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const tickets = row.getValue("tickets") as number;
      return <div className="text-center">{tickets}</div>;
    },
  },

  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total
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
  },

  {
    accessorKey: "tourDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de reserva
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("tourDate") as string;
      if (!date) return <div>—</div>;
      return (
        <div>{moment(date).locale("es").format("dddd, D [de] MMMM - h:mm A")}</div>
      );
    },
    sortingFn: "datetime",
  },

  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "completed"
              ? "default"
              : status === "cancelled"
                ? "destructive"
                : "outline"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },

];
