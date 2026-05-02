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

import { type RentalTermsFormValues, getRentalTermsSchema } from "./types";
import { focusFirstStepField, scrollToFirstError } from "../add-tour/utils";
import { useLanguage } from "@/lib/i18n-context";

interface RentalTermsStepProps {
  onSubmit: (data: RentalTermsFormValues) => void;
  defaultValues?: Partial<RentalTermsFormValues>;
}

export function RentalTermsStep({ onSubmit, defaultValues }: RentalTermsStepProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => getRentalTermsSchema(t), [t]);

  const form = useForm<RentalTermsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_location: defaultValues?.pickup_location ?? "",
      offers_delivery: defaultValues?.offers_delivery ?? false,
      max_delivery_distance_km: defaultValues?.max_delivery_distance_km ?? 0,
      base_delivery_fee: defaultValues?.base_delivery_fee ?? "0",
      fee_per_km: defaultValues?.fee_per_km ?? "0",
      available_from: defaultValues?.available_from ?? "",
      available_until: defaultValues?.available_until ?? "",
      is_available: defaultValues?.is_available ?? true,
      is_live: defaultValues?.is_live ?? true,
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const offersDelivery = form.watch("offers_delivery");

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [defaultValues?.pickup_location]);

  const handleSubmit = form.handleSubmit(
    (data) => onSubmit(data),
    (errors) => scrollToFirstError(errors),
  );

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="pickup_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("dashboard.addRental.terms.pickup")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("dashboard.addRental.terms.pickupPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              name="base_delivery_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.addRental.terms.baseDeliveryFee")}</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="decimal" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="available_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.terms.availableFrom")}</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="available_until"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.terms.availableUntil")}</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="is_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel className="text-base">{t("dashboard.addRental.terms.isAvailable")}</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_live"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel className="text-base">{t("dashboard.addRental.terms.isLive")}</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel className="text-base">{t("dashboard.addRental.terms.isActive")}</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
