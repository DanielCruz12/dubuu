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
import { Switch } from "@/components/ui/switch";

import { type RentalDeliveryFormValues, getRentalDeliverySchema } from "./types";
import { focusFirstStepField, scrollToFirstError } from "../add-tour/utils";
import { useLanguage } from "@/lib/i18n-context";

interface RentalDeliveryStepProps {
  onSubmit: (data: RentalDeliveryFormValues) => void;
  defaultValues?: Partial<RentalDeliveryFormValues>;
}

export function RentalDeliveryStep({ onSubmit, defaultValues }: RentalDeliveryStepProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => getRentalDeliverySchema(t), [t]);

  const form = useForm<RentalDeliveryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      offers_delivery: defaultValues?.offers_delivery ?? false,
      max_delivery_distance_km: defaultValues?.max_delivery_distance_km ?? 0,
      fee_per_km: defaultValues?.fee_per_km ?? "0",
    },
  });

  const offersDelivery = form.watch("offers_delivery");

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [defaultValues?.offers_delivery]);

  const handleSubmit = form.handleSubmit(
    (data) => onSubmit(data),
    (errors) => scrollToFirstError(errors),
  );

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="offers_delivery"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("dashboard.addRental.terms.offersDelivery")}</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {offersDelivery ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="max_delivery_distance_km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.addRental.terms.maxDeliveryKm")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fee_per_km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.addRental.terms.feePerKm")}</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="decimal" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}
      </form>
    </Form>
  );
}
