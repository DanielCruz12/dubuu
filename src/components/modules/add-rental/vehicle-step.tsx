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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type RentalVehicleFormValues, getRentalVehicleSchema } from "./types";
import { focusFirstStepField, scrollToFirstError } from "../add-tour/utils";
import { useLanguage } from "@/lib/i18n-context";

interface RentalVehicleStepProps {
  onSubmit: (data: RentalVehicleFormValues) => void;
  defaultValues?: Partial<RentalVehicleFormValues>;
}

export function RentalVehicleStep({ onSubmit, defaultValues }: RentalVehicleStepProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => getRentalVehicleSchema(t), [t]);

  const form = useForm<RentalVehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: defaultValues?.brand ?? "",
      model: defaultValues?.model ?? "",
      year: defaultValues?.year ?? new Date().getFullYear(),
      condition: defaultValues?.condition ?? "used",
      fuel_type: defaultValues?.fuel_type ?? "gasoline",
      color: defaultValues?.color ?? "",
      engine: defaultValues?.engine ?? "",
      transmission: defaultValues?.transmission ?? "automatic",
      seating_capacity: defaultValues?.seating_capacity ?? 5,
    },
  });

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [defaultValues?.brand]);

  const handleSubmit = form.handleSubmit(
    (data) => onSubmit(data),
    (errors) => scrollToFirstError(errors),
  );

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("dashboard.addRental.vehicle.brand")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("dashboard.addRental.vehicle.brandPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.model")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("dashboard.addRental.vehicle.modelPlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.color")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("dashboard.addRental.vehicle.condition")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">{t("dashboard.addRental.vehicle.conditionNew")}</SelectItem>
                    <SelectItem value="used">{t("dashboard.addRental.vehicle.conditionUsed")}</SelectItem>
                    <SelectItem value="refurbished">
                      {t("dashboard.addRental.vehicle.conditionRefurbished")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.transmission")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="automatic">
                      {t("dashboard.addRental.vehicle.transmissionAutomatic")}
                    </SelectItem>
                    <SelectItem value="manual">{t("dashboard.addRental.vehicle.transmissionManual")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fuel_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.fuel")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gasoline">{t("dashboard.addRental.vehicle.fuelGasoline")}</SelectItem>
                    <SelectItem value="diesel">{t("dashboard.addRental.vehicle.fuelDiesel")}</SelectItem>
                    <SelectItem value="electric">{t("dashboard.addRental.vehicle.fuelElectric")}</SelectItem>
                    <SelectItem value="hybrid">{t("dashboard.addRental.vehicle.fuelHybrid")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("dashboard.addRental.vehicle.year")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seating_capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.seats")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="engine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.engine")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("dashboard.addRental.vehicle.enginePlaceholder")} />
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
