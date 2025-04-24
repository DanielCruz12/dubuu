"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionCell } from "../(components)/action-cell";

// Define el tipo para los datos de tour
export type Tour = {
  id: string;
  name: string;
  description: string;
  price: number;
  departure_point: string;
  address: string;
  country: string;
  is_active?: boolean;
  current_date?: string; // Fecha actual seleccionada
  dates?: {
    id: string;
    date: string;
    available_spots: number | string;
  }[];
};

// Define las columnas para la tabla de tours
export const toursColumns: ColumnDef<Tour>[] = [
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
    accessorKey: "current_date",
    header: "Fecha del Tour",
    cell: ({ row }) => {
      const date = row.getValue("current_date") as string;
      return <div>{date || "No disponible"}</div>;
    },
  },
  {
    accessorKey: "departure_point",
    header: "Punto de Salida",
    cell: ({ row }) => {
      return <div>{row.getValue("departure_point") || "No especificado"}</div>;
    },
  },
  {
    accessorKey: "max_people",
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
      const maxPeople = (row.getValue("max_people") as number) || 0;
      return <div className="text-center">{maxPeople}</div>;
    },
  },
  {
    accessorKey: "available_spots",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Plazas Disponibles
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const availableSpots = (row.getValue("available_spots") as number) || 0;
      return <div className="text-center">{availableSpots}</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "outline"}>
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // Usamos el componente ActionCell en lugar de definir la lógica aquí
      return <ActionCell tour={row.original} />;
    },
  },
];
