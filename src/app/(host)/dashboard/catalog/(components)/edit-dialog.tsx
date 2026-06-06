"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { IProductTypes } from "@/types/product";
import {
  useCreateProductTypeMutation,
  useUpdateProductTypeMutation,
} from "@/redux/slices/product/product-types";
import { useLanguage } from "@/lib/i18n-context";
import { toast } from "sonner";

const productTypeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
});

type ProductTypeFormValues = z.infer<typeof productTypeSchema>;

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: IProductTypes | null;
}

export function EditDialog({ open, onOpenChange, item }: EditDialogProps) {
  const { t } = useLanguage();
  const isEditing = item !== null;
  const [createProductType, { isLoading: isCreating }] =
    useCreateProductTypeMutation();
  const [updateProductType, { isLoading: isUpdating }] =
    useUpdateProductTypeMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<ProductTypeFormValues>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: item?.name ?? "",
        description: item?.description ?? "",
      });
    }
  }, [open, item, form]);

  const onSubmit = async (values: ProductTypeFormValues) => {
    try {
      if (isEditing && item) {
        await updateProductType({
          id: item.id,
          data: values,
        }).unwrap();
        toast.success(t("catalog.toast.updated"));
      } else {
        await createProductType(values).unwrap();
        toast.success(t("catalog.toast.created"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("catalog.toast.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("catalog.edit.title")
              : t("catalog.createDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("catalog.edit.description")
              : t("catalog.createDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("catalog.form.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("catalog.form.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("catalog.form.description")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("catalog.form.descriptionPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar cambios"
                    : t("catalog.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
