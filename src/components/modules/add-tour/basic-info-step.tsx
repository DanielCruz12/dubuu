"use client";

import { useMemo, useEffect, useRef, type RefObject } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type BasicInfoFormValues, getBasicInfoSchema } from "./types";
import { focusFirstStepField, scrollToFirstError } from "./utils";
import {
  filterIntegerChars,
  filterSafeText,
  handleFilteredChange,
  handleFilteredKeyDown,
  handleFilteredPaste,
  numericBlockedMessage,
  textBlockedMessage,
  fieldBorderClass,
  VALIDATION_LIMITS,
} from "./validation";
import { FormErrorSummary } from "./form-error-summary";
import { useLanguage } from "@/lib/i18n-context";
import { getCountrySelectOptions } from "@/lib/country-options";
import { cn } from "@/lib/utils";

interface BasicInfoStepProps {
  onSubmit: (data: BasicInfoFormValues) => void;
  defaultValues?: Partial<BasicInfoFormValues>;
  /** Ref del form que usa el padre para disparar requestSubmit() en Continuar. */
  formRef?: RefObject<HTMLFormElement>;
}

export function BasicInfoStep({
  onSubmit,
  defaultValues,
  formRef: externalFormRef,
}: BasicInfoStepProps) {
  const { t, language } = useLanguage();
  const internalFormRef = useRef<HTMLFormElement>(null);
  const formRef = externalFormRef ?? internalFormRef;
  const basicInfoSchema = useMemo(() => getBasicInfoSchema(t), [t]);

  const countryOptions = useMemo(
    () => getCountrySelectOptions(language),
    [language],
  );

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      departure_point: defaultValues?.departure_point || "",
      address: defaultValues?.address || "",
      country: defaultValues?.country || "SV",
      max_people: defaultValues?.max_people || undefined,
      duration: defaultValues?.duration ?? 1,
    },
  });

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [formRef, defaultValues?.name, defaultValues?.description]);

  // Avisa con un error puntual cuando se bloquea un carácter al escribir/pegar.
  const reportTextBlocked =
    (name: keyof BasicInfoFormValues) => (char: string) => {
      form.setError(
        name,
        { type: "manual", message: textBlockedMessage(t, char) },
        { shouldFocus: false },
      );
    };
  const reportNumericBlocked =
    (name: keyof BasicInfoFormValues) => (char: string) => {
      form.setError(
        name,
        { type: "manual", message: numericBlockedMessage(t, char) },
        { shouldFocus: false },
      );
    };

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      scrollToFirstError(errors, formRef.current);
    }
  );

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormErrorSummary />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addTour.basicInfo.name")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={VALIDATION_LIMITS.NAME_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterSafeText,
                        field.onChange,
                        reportTextBlocked("name"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterSafeText,
                        reportTextBlocked("name"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterSafeText,
                        (v) => field.onChange(v),
                        reportTextBlocked("name"),
                      )
                    }
                    placeholder={t("dashboard.addTour.basicInfo.namePlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addTour.basicInfo.description")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterSafeText,
                        field.onChange,
                        reportTextBlocked("description"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterSafeText,
                        reportTextBlocked("description"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterSafeText,
                        (v) => field.onChange(v),
                        reportTextBlocked("description"),
                      )
                    }
                    placeholder={t("dashboard.addTour.basicInfo.descriptionPlaceholder")}
                    className={cn(
                      "focus:ring-0 focus:border-black dark:focus:border-white min-h-[100px] border-gray-200 dark:border-gray-800",
                      fieldState.error &&
                        "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departure_point"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.basicInfo.departure_point")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={VALIDATION_LIMITS.DEPARTURE_POINT_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterSafeText,
                        field.onChange,
                        reportTextBlocked("departure_point"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterSafeText,
                        reportTextBlocked("departure_point"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterSafeText,
                        (v) => field.onChange(v),
                        reportTextBlocked("departure_point"),
                      )
                    }
                    placeholder={t("dashboard.addTour.basicInfo.departure_pointPlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_people"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.basicInfo.max_people")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    placeholder={t("dashboard.addTour.basicInfo.max_peoplePlaceholder")}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterIntegerChars,
                        field.onChange,
                        reportNumericBlocked("max_people"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterIntegerChars,
                        reportNumericBlocked("max_people"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterIntegerChars,
                        (v) => field.onChange(v),
                        reportNumericBlocked("max_people"),
                      )
                    }
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addTour.basicInfo.address")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={VALIDATION_LIMITS.ADDRESS_MAX}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterSafeText,
                        field.onChange,
                        reportTextBlocked("address"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterSafeText,
                        reportTextBlocked("address"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterSafeText,
                        (v) => field.onChange(v),
                        reportTextBlocked("address"),
                      )
                    }
                    placeholder={t("dashboard.addTour.basicInfo.addressPlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.basicInfo.country")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      data-error-field={field.name}
                      className={cn(
                        "focus:ring-0",
                        fieldBorderClass(fieldState.error),
                      )}
                    >
                      <SelectValue
                        placeholder={t("dashboard.addTour.basicInfo.countryPlaceholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper" className="max-h-72">
                    {countryOptions.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.basicInfo.duration")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    placeholder={t("dashboard.addTour.basicInfo.durationPlaceholder")}
                    onChange={(e) =>
                      handleFilteredChange(
                        e,
                        filterIntegerChars,
                        field.onChange,
                        reportNumericBlocked("duration"),
                      )
                    }
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(
                        e,
                        filterIntegerChars,
                        reportNumericBlocked("duration"),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(
                        e,
                        filterIntegerChars,
                        (v) => field.onChange(v),
                        reportNumericBlocked("duration"),
                      )
                    }
                    className={cn(
                      "focus:ring-0",
                      fieldBorderClass(fieldState.error),
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
