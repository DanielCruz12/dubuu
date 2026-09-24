"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { useDeleteProductMutation } from "@/redux/slices/product/product-slice";
import { useLanguage } from "@/lib/i18n-context";
import type { IProduct } from "@/types/product";

interface AdminDeleteCellProps {
  product: IProduct;
  onDeleted?: (productId: string) => void;
}

export function AdminDeleteCell({ product, onDeleted }: AdminDeleteCellProps) {
  const { t } = useLanguage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(product.id).unwrap();
      setShowDeleteDialog(false);
      toast.success(t("dashboard.adminProducts.delete.success"));
      onDeleted?.(product.id);
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error(t("dashboard.adminProducts.delete.error"));
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => setShowDeleteDialog(true)}
        aria-label={t("dashboard.adminProducts.table.delete")}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.adminProducts.delete.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.adminProducts.delete.confirmDescription").replace(
                "{{name}}",
                product.name,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("dashboard.adminProducts.delete.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteProduct();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting
                ? t("dashboard.adminProducts.delete.deleting")
                : t("dashboard.adminProducts.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
