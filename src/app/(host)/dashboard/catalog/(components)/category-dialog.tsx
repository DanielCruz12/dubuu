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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetProductTypesQuery } from "@/redux/slices/product/product-types";
import { useCreateProductCategoryMutation } from "@/redux/slices/product/product-category";
import { useLanguage } from "@/lib/i18n-context";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  product_type_id: z.string().min(1, "Selecciona un tipo de producto"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDialog({ open, onOpenChange }: CategoryDialogProps) {
  const { t } = useLanguage();
  const { data: productTypes } = useGetProductTypesQuery();
  const [createCategory, { isLoading }] = useCreateProductCategoryMutation();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", product_type_id: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: "", description: "", product_type_id: "" });
    }
  }, [open, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      await createCategory(values).unwrap();
      toast.success(t("catalog.categories.toast.created"));
      onOpenChange(false);
    } catch {
      toast.error(t("catalog.toast.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("catalog.categories.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("catalog.categories.dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="product_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("catalog.form.productType")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("catalog.form.productTypePlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(productTypes ?? []).map((pt) => (
                        <SelectItem key={pt.id} value={pt.id}>
                          {pt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : t("catalog.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
