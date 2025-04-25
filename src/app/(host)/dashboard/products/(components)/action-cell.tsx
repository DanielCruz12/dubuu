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
import { Tour } from "../(columns)/columns";
import { EditProductModal } from "./edit-product-modal";

interface ActionCellProps {
  tour: Tour;
  onUpdate?: (updatedTour: Partial<Tour>) => void;
  selectedDateId?: string;
}

export function ActionCell({
  tour,
  onUpdate,
  selectedDateId,
}: ActionCellProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSaveTour = (updatedTour: Partial<Tour>) => {
    console.log("Tour actualizado:", updatedTour);
    if (onUpdate) {
      onUpdate(updatedTour);
    }
    setShowEditModal(false);
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
            onClick={() => navigator.clipboard.writeText(tour.id)}
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
        selectedDateId={selectedDateId}
      />
    </>
  );
}
