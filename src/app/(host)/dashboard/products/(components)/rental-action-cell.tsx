"use client";

import { useRef, useState } from "react";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
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
import type { IRentalProduct } from "@/types/rental";
import { toast } from "sonner";
import { useDeleteProductMutation } from "@/redux/slices/product/product-slice";
import { useLanguage } from "@/lib/i18n-context";

interface RentalActionCellProps {
  product: IRentalProduct;
  onDeleted?: () => void;
}

export function RentalActionCell({ product, onDeleted }: RentalActionCellProps) {
  const { t } = useLanguage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id).unwrap();
      setShowDeleteDialog(false);
      toast.success(t("dashboard.products.actions.deleteSuccess"));
      onDeleted?.();
    } catch (e) {
      console.error(e);
      toast.error(t("dashboard.products.actions.deleteError"));
    }
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button ref={triggerRef} variant="secondary" className="h-8 w-8 p-0">
            <span className="sr-only">Menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("dashboard.products.actions.menuLabel")}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              void navigator.clipboard.writeText(product.id);
              toast.success(t("dashboard.products.actions.copyIdSuccess"));
            }}
          >
            <Copy className="mr-2 h-4 w-4 shrink-0" />
            {t("dashboard.products.actions.copyId")}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/products/add?edit=${encodeURIComponent(product.id)}`}>
              <Pencil className="mr-2 h-4 w-4 shrink-0" />
              {t("dashboard.products.actions.edit")}
            </Link>
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
              {t("dashboard.products.actions.deleteConfirmDescription").replace("{{name}}", product.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("dashboard.products.actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("dashboard.products.actions.deleting") : t("dashboard.products.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
