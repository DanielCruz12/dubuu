"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionCell } from "../(components)/action-cell";
import type { ITourProduct } from "@/types/product";
import moment from "moment";
import "moment/locale/es";

// Define las columnas para la tabla de tours
export const toursColumns: ColumnDef<
  ITourProduct & { selectedDateId?: string }
>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
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
          Precio
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
    header: "Fecha",
    cell: ({ row }) => {
      const tour = row.original;
      const selectedDateId = tour.selectedDateId;

      if (!selectedDateId || !tour.tour.tour_dates) {
        return <div>No disponible</div>;
      }

      const selectedDate = tour.tour.tour_dates.find(
        (date) => date.id === selectedDateId
      );

      if (!selectedDate) {
        return <div>No disponible</div>;
      }

      return (
        <div>
          {moment(selectedDate.date).format("dddd, D [de] MMMM - h:mm A")}
        </div>
      );
    },
  },
  {
    id: "departure_point",
    header: "Punto de Salida",
    cell: ({ row }) => {
      const tour = row.original;
      return <div>{tour.tour.departure_point || "No especificado"}</div>;
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
          Máx. Personas
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tour = row.original;
      const selectedDateId = tour.selectedDateId;

      if (!selectedDateId || !tour.tour.tour_dates) {
        return <div className="text-center">0</div>;
      }

      const selectedDate = tour.tour.tour_dates.find(
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
    header: "Reservas",
    cell: ({ row }) => {
      const tour = row.original;
      const selectedDateId = tour.selectedDateId;

      if (!selectedDateId || !tour.tour.tour_dates) {
        return <div className="text-center">0</div>;
      }

      const selectedDate = tour.tour.tour_dates.find(
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
          Plazas Disp.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tour = row.original;
      const selectedDateId = tour.selectedDateId;

      if (!selectedDateId || !tour.tour.tour_dates) {
        return <div className="text-center">0</div>;
      }

      const selectedDate = tour.tour.tour_dates.find(
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
    header: "Disponibilidad",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Visible" : "Oculto"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "is_approved",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("is_approved") as boolean;
      return (
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Aprobado" : "Pendiente"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // Usamos el componente ActionCell en lugar de definir la lógica aquí
      return (
        <ActionCell
          tour={row.original}
          selectedDateId={row.original.selectedDateId}
        />
      );
    },
  },
];
