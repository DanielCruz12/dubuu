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
import { useGetProductCategoriesQuery } from "@/redux/slices/product/product-category";
import { useCreateProductAmenityMutation } from "@/redux/slices/product/product-amenity";
import { useLanguage } from "@/lib/i18n-context";
import { toast } from "sonner";

const amenitySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  category_id: z.string().min(1, "Selecciona una categoría"),
});

type AmenityFormValues = z.infer<typeof amenitySchema>;

interface AmenityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AmenityDialog({ open, onOpenChange }: AmenityDialogProps) {
  const { t } = useLanguage();
  const { data: categories } = useGetProductCategoriesQuery();
  const [createAmenity, { isLoading }] = useCreateProductAmenityMutation();

  const form = useForm<AmenityFormValues>({
    resolver: zodResolver(amenitySchema),
    defaultValues: { name: "", description: "", category_id: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: "", description: "", category_id: "" });
    }
  }, [open, form]);

  const onSubmit = async (values: AmenityFormValues) => {
    try {
      await createAmenity(values).unwrap();
      toast.success(t("catalog.amenities.toast.created"));
      onOpenChange(false);
    } catch {
      toast.error(t("catalog.toast.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("catalog.amenities.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("catalog.amenities.dialogDescription")}
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
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("catalog.form.category")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("catalog.form.categoryPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(categories ?? []).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
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
