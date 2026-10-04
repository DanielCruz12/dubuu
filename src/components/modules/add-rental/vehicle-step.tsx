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
import {
  filterIntegerChars,
  filterDecimalChars,
  filterSafeText,
  filterPlateChars,
  filterVinChars,
  handleFilteredChange,
  handleFilteredKeyDown,
  handleFilteredPaste,
  numericBlockedMessage,
  textBlockedMessage,
  fieldBorderClass,
  VALIDATION_LIMITS,
} from "../add-tour/validation";
import { FormErrorSummary } from "../add-tour/form-error-summary";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

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
    mode: "onTouched",
    reValidateMode: "onChange",
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
      plate: defaultValues?.plate ?? "",
      vin: defaultValues?.vin ?? "",
      has_gps: defaultValues?.has_gps ?? false,
      has_deposit: defaultValues?.has_deposit ?? false,
      deposit_amount: defaultValues?.deposit_amount ?? "",
    },
  });

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [defaultValues?.brand]);

  // Avisa con un error puntual cuando se bloquea un carácter al escribir/pegar.
  const reportTextBlocked =
    (name: keyof RentalVehicleFormValues) => (char: string) => {
      form.setError(
        name,
        { type: "manual", message: textBlockedMessage(t, char) },
        { shouldFocus: false },
      );
    };
  const reportNumericBlocked =
    (name: keyof RentalVehicleFormValues) => (char: string) => {
      form.setError(
        name,
        { type: "manual", message: numericBlockedMessage(t, char) },
        { shouldFocus: false },
      );
    };

  const handleSubmit = form.handleSubmit(
    (data) => onSubmit(data),
    (errors) => scrollToFirstError(errors, formRef.current),
  );

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormErrorSummary />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("dashboard.addRental.vehicle.brand")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={VALIDATION_LIMITS.BRAND_MODEL_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterSafeText,
                        field.onChange,
                        reportTextBlocked("brand"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterSafeText,
                        reportTextBlocked("brand"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterSafeText,
                        (v) => field.onChange(v),
                        reportTextBlocked("brand"),
                      )
                    }
                    placeholder={t("dashboard.addRental.vehicle.brandPlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.model")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={VALIDATION_LIMITS.BRAND_MODEL_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterSafeText,
                        field.onChange,
                        reportTextBlocked("model"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterSafeText,
                        reportTextBlocked("model"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterSafeText,
                        (v) => field.onChange(v),
                        reportTextBlocked("model"),
                      )
                    }
                    placeholder={t("dashboard.addRental.vehicle.modelPlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.color")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      data-error-field={field.name}
                      className={cn(
                        "focus:ring-0",
                        fieldBorderClass(fieldState.error),
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      { value: "red", label: t("dashboard.addRental.vehicle.colorRed"), dot: "bg-red-500" },
                      { value: "white", label: t("dashboard.addRental.vehicle.colorWhite"), dot: "bg-white border" },
                      { value: "blue", label: t("dashboard.addRental.vehicle.colorBlue"), dot: "bg-blue-500" },
                      { value: "black", label: t("dashboard.addRental.vehicle.colorBlack"), dot: "bg-black" },
                      { value: "green", label: t("dashboard.addRental.vehicle.colorGreen"), dot: "bg-green-500" },
                      { value: "yellow", label: t("dashboard.addRental.vehicle.colorYellow"), dot: "bg-yellow-400" },
                      { value: "gray", label: t("dashboard.addRental.vehicle.colorGray"), dot: "bg-gray-400" },
                    ].map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="flex items-center gap-2">
                          <span className={`inline-block h-4 w-4 rounded-full ${c.dot}`} />
                          {c.label}
                        </span>
                      </SelectItem>
                    ))}
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
            name="condition"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("dashboard.addRental.vehicle.condition")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      data-error-field={field.name}
                      className={cn(
                        "focus:ring-0",
                        fieldBorderClass(fieldState.error),
                      )}
                    >
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
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.transmission")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      data-error-field={field.name}
                      className={cn(
                        "focus:ring-0",
                        fieldBorderClass(fieldState.error),
                      )}
                    >
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
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.fuel")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      data-error-field={field.name}
                      className={cn(
                        "focus:ring-0",
                        fieldBorderClass(fieldState.error),
                      )}
                    >
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
            render={({ field, fieldState }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("dashboard.addRental.vehicle.year")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterIntegerChars,
                        field.onChange,
                        reportNumericBlocked("year"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterIntegerChars,
                        reportNumericBlocked("year"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterIntegerChars,
                        (v) => field.onChange(v),
                        reportNumericBlocked("year"),
                      )
                    }
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seating_capacity"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.seats")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterIntegerChars,
                        field.onChange,
                        reportNumericBlocked("seating_capacity"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterIntegerChars,
                        reportNumericBlocked("seating_capacity"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterIntegerChars,
                        (v) => field.onChange(v),
                        reportNumericBlocked("seating_capacity"),
                      )
                    }
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="engine"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.engine")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={VALIDATION_LIMITS.ENGINE_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterSafeText,
                        field.onChange,
                        reportTextBlocked("engine"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterSafeText,
                        reportTextBlocked("engine"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterSafeText,
                        (v) => field.onChange(v),
                        reportTextBlocked("engine"),
                      )
                    }
                    placeholder={t("dashboard.addRental.vehicle.enginePlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="plate"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.plate")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={VALIDATION_LIMITS.PLATE_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterPlateChars,
                        field.onChange,
                        reportTextBlocked("plate"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterPlateChars,
                        reportTextBlocked("plate"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterPlateChars,
                        (v) => field.onChange(v),
                        reportTextBlocked("plate"),
                      )
                    }
                    placeholder={t("dashboard.addRental.vehicle.platePlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vin"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addRental.vehicle.vin")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={VALIDATION_LIMITS.VIN_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterVinChars,
                        field.onChange,
                        reportTextBlocked("vin"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterVinChars,
                        reportTextBlocked("vin"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterVinChars,
                        (v) => field.onChange(v),
                        reportTextBlocked("vin"),
                      )
                    }
                    placeholder={t("dashboard.addRental.vehicle.vinPlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="has_gps"
            render={({ field }) => (
              <FormItem className="flex flex-row items-end gap-2 pb-1">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-primary"
                  />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">
                  {t("dashboard.addRental.vehicle.hasGps")}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
          <FormField
            control={form.control}
            name="has_deposit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-end gap-2 pb-1">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-primary"
                  />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">
                  {t("dashboard.addRental.vehicle.hasDeposit")}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("has_deposit") && (
            <FormField
              control={form.control}
              name="deposit_amount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.addRental.vehicle.depositAmount")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      onChange={(e) =>
                        handleFilteredChange(
                          e,
                          filterDecimalChars,
                          field.onChange,
                          reportNumericBlocked("deposit_amount"),
                        )
                      }
                      onKeyDown={(e) =>
                        handleFilteredKeyDown(
                          e,
                          filterDecimalChars,
                          reportNumericBlocked("deposit_amount"),
                        )
                      }
                      onPaste={(e) =>
                        handleFilteredPaste(
                          e,
                          filterDecimalChars,
                          (v) => field.onChange(v),
                          reportNumericBlocked("deposit_amount"),
                        )
                      }
                      placeholder="200.00"
                      className={cn(
                        "focus:ring-0",
                        fieldBorderClass(fieldState.error),
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </form>
    </Form>
  );
}
