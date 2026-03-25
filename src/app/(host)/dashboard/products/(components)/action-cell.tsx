"use client";

import { useRef, useState } from "react";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
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
import { EditProductModal, type EditTourModalPatch } from "./edit-product-modal";
import type { ITourProduct } from "@/types/product";
import { toast } from "sonner";
import { useUpdateProductMutation, useDeleteProductMutation } from "@/redux/slices/product/product-slice";
import { useLanguage } from "@/lib/i18n-context";
import { useUser } from "@clerk/nextjs";

function isFetchBaseQueryError(e: unknown): e is FetchBaseQueryError {
  return typeof e === "object" && e !== null && "status" in e;
}

function patchErrorMessage(error: unknown, t: (key: string) => string): string {
  if (isFetchBaseQueryError(error)) {
    if (error.status === 403) {
      return t("dashboard.products.editModal.error403");
    }
    const raw = error.data;
    if (typeof raw === "string") return raw;
    if (raw && typeof raw === "object") {
      const d = raw as { message?: string | string[]; error?: string };
      if (d.message) {
        return Array.isArray(d.message) ? d.message.join(", ") : d.message;
      }
      if (d.error) return d.error;
    }
  }
  return t("dashboard.products.editModal.errorGeneric");
}

interface ActionCellProps {
  tour: ITourProduct & { selectedDateId?: string };
  onUpdate?: (updatedTour: Partial<ITourProduct>) => void;
  selectedDateId?: string;
  onDeleted?: () => void;
}

export function ActionCell({ tour, selectedDateId, onDeleted }: ActionCellProps) {
  const { t } = useLanguage();
  const { user } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  // Usar el selectedDateId del tour si no se proporciona explícitamente
  const dateId = selectedDateId || tour.selectedDateId;

  const handleSaveTour = async (patch: EditTourModalPatch) => {
    const userId = user?.id;
    if (!userId) {
      toast.error(t("dashboard.products.editModal.errorNoUser"));
      return;
    }
    try {
      const { selectedDateId, ...rest } = patch;
      await updateProduct({
        id: tour.id,
        data: {
          ...rest,
          user_id: userId,
          ...(selectedDateId
            ? { selectedDateId, selected_date_id: selectedDateId }
            : {}),
        },
      }).unwrap();

      toast.success(t("dashboard.products.editModal.saveSuccess"));

      setShowEditModal(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error(patchErrorMessage(error, t));
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
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button ref={triggerRef} variant="secondary" className="h-8 w-8 p-0">
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
            <Copy className="mr-2 h-4 w-4 shrink-0" />
            {t("dashboard.products.actions.copyId")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              queueMicrotask(() => setShowEditModal(true));
            }}
          >
            <Pencil className="mr-2 h-4 w-4 shrink-0" />
            {t("dashboard.products.actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              queueMicrotask(() => setShowDeleteDialog(true));
            }}
          >
            <Trash2 className="mr-2 h-4 w-4 shrink-0" />
            {t("dashboard.products.actions.deleteProduct")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) queueMicrotask(() => triggerRef.current?.focus());
        }}
      >
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
