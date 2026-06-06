"use client";

import { useRef, useState } from "react";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
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
import type { IProductAudience } from "@/types/product";
import { useDeleteProductAudienceMutation } from "@/redux/slices/product/product-audience";
import { useLanguage } from "@/lib/i18n-context";
import { toast } from "sonner";

interface AudienceActionCellProps {
  audience: IProductAudience;
  onDeleted: () => void;
}

export function AudienceActionCell({
  audience,
  onDeleted,
}: AudienceActionCellProps) {
  const { t } = useLanguage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [deleteAudience, { isLoading: isDeleting }] =
    useDeleteProductAudienceMutation();

  const handleDelete = async () => {
    try {
      await deleteAudience(audience.id).unwrap();
      setShowDeleteDialog(false);
      toast.success(t("catalog.audience.toast.deleted"));
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
              navigator.clipboard.writeText(audience.id);
              toast.success("ID copiado");
            }}
          >
            <Copy className="mr-2 h-4 w-4 shrink-0" />
            Copiar ID
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
            <AlertDialogTitle>
              {t("catalog.audience.delete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("catalog.audience.delete.description").replace(
                "{{name}}",
                audience.name
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
