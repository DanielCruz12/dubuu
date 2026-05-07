"use client";

import { useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { type RentalBasicFormValues, getRentalBasicSchema } from "./types";
import { focusFirstStepField, scrollToFirstError } from "../add-tour/utils";
import { useLanguage } from "@/lib/i18n-context";

interface RentalBasicStepProps {
  onSubmit: (data: RentalBasicFormValues) => void;
  defaultValues?: Partial<RentalBasicFormValues>;
}

export function RentalBasicStep({ onSubmit, defaultValues }: RentalBasicStepProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => getRentalBasicSchema(t), [t]);

  const form = useForm<RentalBasicFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
  });

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [defaultValues?.name, defaultValues?.description]);

  const handleSubmit = form.handleSubmit(
    (data) => onSubmit(data),
    (errors) => scrollToFirstError(errors),
  );

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addRental.basic.name")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("dashboard.addRental.basic.namePlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addRental.basic.description")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={5}
                    placeholder={t("dashboard.addRental.basic.descriptionPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
