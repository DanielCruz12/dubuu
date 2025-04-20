"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define el tipo para los datos de reserva
export type Booking = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  product_id: string;
  tour_name: string;
  tour_date: string;
  tour_date_id: string;
  status: string;
  is_live: boolean;
  tickets: number;
  total: string;
  paymentMethod: string;
  idTransaccion: string;
  created_at: string;
  updated_at: string;
};

// Función para renderizar el badge de estado
function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "outline" | "secondary" | "destructive" = "outline";
  let label = status;

  switch (status) {
    case "completed":
      variant = "default";
      label = "Completado";
      break;
    case "pending":
      variant = "secondary";
      label = "Pendiente";
      break;
    case "cancelled":
      variant = "destructive";
      label = "Cancelado";
      break;
  }

  return <Badge variant={variant}>{label}</Badge>;
}

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
      const user = row.getValue("user") as Booking["user"];
      return (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const userA = rowA.getValue("user") as Booking["user"];
      const userB = rowB.getValue("user") as Booking["user"];
      return userA.name.localeCompare(userB.name);
    },
  },
  {
    accessorKey: "tour_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tour
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tourName = row.getValue("tour_name") as string;
      return (
        <div className="max-w-[200px] truncate" title={tourName}>
          {tourName}
        </div>
      );
    },
  },
  {
    accessorKey: "tour_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("tour_date"));
      return <div>{date.toLocaleDateString()}</div>;
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "tickets",
    header: ({ column }) => {
      return (
        <div className="text-center">
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
        <div className="text-right">
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
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Estado
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="text-center">
          <StatusBadge status={status} />
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Método de Pago
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const paymentMethod = row.getValue("paymentMethod") as string;
      const idTransaccion = row.original.idTransaccion;

      let paymentLabel = "";
      switch (paymentMethod) {
        case "credit":
          paymentLabel = "Tarjeta de Crédito";
          break;
        case "debit":
          paymentLabel = "Tarjeta de Débito";
          break;
        case "paypal":
          paymentLabel = "PayPal";
          break;
        case "cash":
          paymentLabel = "Efectivo";
          break;
        default:
          paymentLabel = paymentMethod;
      }

      return (
        <div>
          <div className="capitalize">{paymentLabel}</div>
          <div className="text-xs text-muted-foreground">
            ID: {idTransaccion}
          </div>
        </div>
      );
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
          Fecha de Reserva
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{date.toLocaleDateString()}</div>;
    },
    sortingFn: "datetime",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const booking = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Cambiar estado</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
