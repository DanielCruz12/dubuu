"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IBooking } from "@/types/booking";
import { BookingActionCell } from "../../(components)/booking-action-cell";

// Define las columnas para la tabla de reservas
export const bookingColumns: ColumnDef<IBooking>[] = [
  {
    accessorKey: "id",
    header: "Booking ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return <div className="font-medium">{id.substring(0, 8)}...</div>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "confirmed"
              ? "default"
              : status === "pending"
                ? "outline"
                : status === "cancelled"
                  ? "destructive"
                  : "secondary"
          }
          className="capitalize"
        >
          {status === "confirmed" ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : status === "cancelled" ? (
            <XCircle className="w-3 h-3 mr-1" />
          ) : null}
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tickets",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tickets
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tickets = row.getValue("tickets") as number;
      return (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-muted-foreground" />
          {tickets}
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const total = Number.parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(total);
      return (
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const paymentMethod = row.getValue("paymentMethod") as string;
      return <div className="capitalize">{paymentMethod}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const created_at = row.getValue("created_at") as string;
      return (
        <div>
          {new Date(created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <BookingActionCell booking={row.original} />;
    },
  },
];
