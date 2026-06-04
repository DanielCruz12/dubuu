"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Switch } from "@/components/ui/switch";
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
import { useUpdateProductMutation } from "@/redux/slices/product/product-slice";
import { useLanguage } from "@/lib/i18n-context";
import type { IRentalProduct } from "@/types/rental";

interface RentalActiveCellProps {
  product: IRentalProduct;
}

export function RentalActiveCell({ product }: RentalActiveCellProps) {
  const { t } = useLanguage();
  const { user } = useUser();
  const [updateProduct] = useUpdateProductMutation();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      setShowDeactivateDialog(true);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("user_id", user?.id ?? "");
      formData.append("is_active", "true");
      formData.append("is_live", "true");
      await updateProduct({ id: product.id, data: formData }).unwrap();
    } catch (e) {
      console.error("Failed to toggle rental active state", e);
    }
  };

  const handleConfirmDeactivate = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", user?.id ?? "");
      formData.append("is_active", "false");
      formData.append("is_live", "false");
      await updateProduct({ id: product.id, data: formData }).unwrap();
    } catch (e) {
      console.error("Failed to deactivate rental", e);
    } finally {
      setShowDeactivateDialog(false);
    }
  };

  return (
    <>
      <Switch
        checked={product.is_active}
        onCheckedChange={(c) => void handleToggle(Boolean(c))}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
        aria-label="Toggle active state"
      />

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.products.rentalTable.deactivateTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.products.rentalTable.deactivateDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("dashboard.products.rentalTable.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmDeactivate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("dashboard.products.rentalTable.deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
