"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProductModal } from "./edit-product-modal";
import type { ITourProduct } from "@/types/product";
import { toast } from "sonner";
import { useUpdateProductMutation } from "@/redux/slices/product/product-slice";

interface ActionCellProps {
  tour: ITourProduct & { selectedDateId?: string };
  onUpdate?: (updatedTour: Partial<ITourProduct>) => void;
  selectedDateId?: string;
}

export function ActionCell({ tour, selectedDateId }: ActionCellProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateProduct] = useUpdateProductMutation();
  // Usar el selectedDateId del tour si no se proporciona explícitamente
  const dateId = selectedDateId || tour.selectedDateId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveTour = async (updateData: any) => {
    try {
      await updateProduct({
        id: tour.id,
        data: updateData,
      }).unwrap();

      toast.success("Tour actualizado correctamente");

      setShowEditModal(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error("Error al actualizar el tour");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(tour.id);
              toast.success("ID copiado al portapapeles");
            }}
          >
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditModal(true)}>
            Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProductModal
        tour={tour}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={handleSaveTour}
        selectedDateId={dateId}
      />
    </>
  );
}
