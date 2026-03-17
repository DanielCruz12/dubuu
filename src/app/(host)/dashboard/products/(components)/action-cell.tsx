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
import { useLanguage } from "@/lib/i18n-context";

interface ActionCellProps {
  tour: ITourProduct & { selectedDateId?: string };
  onUpdate?: (updatedTour: Partial<ITourProduct>) => void;
  selectedDateId?: string;
  onDeleted?: () => void;
}

export function ActionCell({ tour, selectedDateId, onDeleted }: ActionCellProps) {
  const { t } = useLanguage();
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
      setShowDeleteDialog(false);
      toast.success(t("dashboard.products.actions.deleteSuccess"));
      onDeleted?.();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error(t("dashboard.products.actions.deleteError"));
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
          <DropdownMenuLabel>{t("dashboard.products.actions.menuLabel")}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(tour.id);
              toast.success(t("dashboard.products.actions.copyIdSuccess"));
            }}
          >
            {t("dashboard.products.actions.copyId")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditModal(true)}>
            {t("dashboard.products.actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("dashboard.products.actions.deleteProduct")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.products.actions.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.products.actions.deleteConfirmDescription").replace("{{name}}", tour.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("dashboard.products.actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteProduct();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("dashboard.products.actions.deleting") : t("dashboard.products.actions.delete")}
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
