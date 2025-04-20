"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  max_people?: number;
  dates?: {
    id: string;
    date: string;
    available_spots: number;
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
    accessorKey: "departure_point",
    header: "Punto de Salida",
    cell: ({ row }) => {
      return <div>{row.getValue("departure_point")}</div>;
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
  /* {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;

      // Esta función simula la actualización del estado
      const handleToggle = (checked: boolean) => {
        console.log(
          `Cambiando estado del tour ${row.original.id} a ${checked ? "activo" : "inactivo"}`
        );
        // Aquí iría la lógica para actualizar el estado en la base de datos
      };

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            aria-label="Toggle tour status"
          />
          <Badge variant={isActive ? "default" : "outline"}>
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      );
    },
  }, */
  /*  {
    id: "actions",
    cell: ({ row }) => {
      const tour = row.original;
      const [showEditModal, setShowEditModal] = useState(false);

      return (
        <>
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
                onClick={() => navigator.clipboard.writeText(tour.id)}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditTourModal
            tour={tour}
            open={showEditModal}
            onOpenChange={setShowEditModal}
            onSave={(updatedTour) => {
              console.log("Tour actualizado:", updatedTour);
              // Aquí iría la lógica para guardar los cambios
              setShowEditModal(false);
            }}
          />
        </>
      );
    },
  }, */
];
