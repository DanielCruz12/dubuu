"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
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
import type { IProduct } from "@/types/product";

interface AdminStatusSwitchProps {
  product: IProduct;
  /** Campo que controla este switch: aprobación o publicación. */
  field: "is_approved" | "is_active";
}

/**
 * Switch verde/rojo para aprobar y publicar productos desde el panel admin.
 * Al APAGAR pide confirmación (patrón de rental-active-cell). Envía FormData
 * con el `user_id` del dueño del producto (la API valida propiedad con ese campo).
 */
export function AdminStatusSwitch({ product, field }: AdminStatusSwitchProps) {
  const { t } = useLanguage();
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [showConfirmOff, setShowConfirmOff] = useState(false);

  const isApproval = field === "is_approved";
  const key = isApproval ? "approve" : "publish";

  const patch = async (value: boolean) => {
    try {
      const formData = new FormData();
      formData.append("user_id", product.user_id);
      formData.append(field, String(value));
      await updateProduct({ id: product.id, data: formData }).unwrap();
      toast.success(t(`dashboard.adminProducts.switches.${key}Success`));
    } catch (e) {
      console.error(`Failed to toggle ${field}`, e);
      toast.error(t(`dashboard.adminProducts.switches.${key}Error`));
    }
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      void patch(true);
      return;
    }
    setShowConfirmOff(true);
  };

  const handleConfirmOff = async () => {
    setShowConfirmOff(false);
    await patch(false);
  };

  return (
    <>
      <Switch
        checked={Boolean(product[field])}
        disabled={isLoading}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
        aria-label={t(
          isApproval
            ? "dashboard.adminProducts.table.approved"
            : "dashboard.adminProducts.table.published",
        )}
      />

      <AlertDialog open={showConfirmOff} onOpenChange={setShowConfirmOff}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(`dashboard.adminProducts.switches.${key}OffTitle`)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(`dashboard.adminProducts.switches.${key}OffDescription`).replace(
                "{{name}}",
                product.name,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("dashboard.adminProducts.switches.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmOff();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t(`dashboard.adminProducts.switches.${key}OffAction`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
