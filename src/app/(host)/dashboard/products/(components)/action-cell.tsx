"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditProductModal } from "./edit-product-modal";
import type { ITourProduct } from "@/types/product";
import { toast } from "sonner";
import { useUpdateProductMutation, useDeleteProductMutation } from "@/redux/slices/product/product-slice";

interface ActionCellProps {
  tour: ITourProduct & { selectedDateId?: string };
  onUpdate?: (updatedTour: Partial<ITourProduct>) => void;
  selectedDateId?: string;
}

export function ActionCell({ tour, selectedDateId }: ActionCellProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
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

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(tour.id).unwrap();
      toast.success("Producto eliminado correctamente");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar el producto");
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
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar producto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el producto &quot;{tour.name}&quot; y toda su información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteProduct();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
