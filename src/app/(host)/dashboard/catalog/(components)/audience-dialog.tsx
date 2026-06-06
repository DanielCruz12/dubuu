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
import { useCreateProductAudienceMutation } from "@/redux/slices/product/product-audience";
import { useLanguage } from "@/lib/i18n-context";
import { toast } from "sonner";

const audienceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
});

type AudienceFormValues = z.infer<typeof audienceSchema>;

interface AudienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AudienceDialog({ open, onOpenChange }: AudienceDialogProps) {
  const { t } = useLanguage();
  const [createAudience, { isLoading }] = useCreateProductAudienceMutation();

  const form = useForm<AudienceFormValues>({
    resolver: zodResolver(audienceSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: "", description: "" });
    }
  }, [open, form]);

  const onSubmit = async (values: AudienceFormValues) => {
    try {
      await createAudience(values).unwrap();
      toast.success(t("catalog.audience.toast.created"));
      onOpenChange(false);
    } catch {
      toast.error(t("catalog.toast.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("catalog.audience.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("catalog.audience.dialogDescription")}
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
