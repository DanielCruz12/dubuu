"use client";

import { useRef, useState } from "react";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import type { IProductTypes } from "@/types/product";
import { useDeleteProductTypeMutation } from "@/redux/slices/product/product-types";
import { useLanguage } from "@/lib/i18n-context";
import { toast } from "sonner";

interface ActionCellProps {
  productType: IProductTypes;
  onEdit: (item: IProductTypes) => void;
  onDeleted: () => void;
}

export function ActionCell({
  productType,
  onEdit,
  onDeleted,
}: ActionCellProps) {
  const { t } = useLanguage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [deleteProductType, { isLoading: isDeleting }] =
    useDeleteProductTypeMutation();

  const handleDelete = async () => {
    try {
      await deleteProductType(productType.id).unwrap();
      setShowDeleteDialog(false);
      toast.success(t("catalog.toast.deleted"));
      onDeleted();
    } catch {
      toast.error(t("catalog.toast.error"));
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
          <DropdownMenuLabel>
            {t("catalog.table.actions")}
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(productType.id);
              toast.success(t("catalog.toast.updated"));
            }}
          >
            <Copy className="mr-2 h-4 w-4 shrink-0" />
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              queueMicrotask(() => onEdit(productType));
            }}
          >
            <Pencil className="mr-2 h-4 w-4 shrink-0" />
            Editar
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
            Eliminar
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
            <AlertDialogTitle>{t("catalog.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("catalog.delete.description").replace(
                "{{name}}",
                productType.name
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
