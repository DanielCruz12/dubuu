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
import {
  filterSafeText,
  handleFilteredChange,
  handleFilteredKeyDown,
  handleFilteredPaste,
  textBlockedMessage,
  VALIDATION_LIMITS,
} from "../add-tour/validation";
import { FormErrorSummary } from "../add-tour/form-error-summary";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

interface RentalBasicStepProps {
  onSubmit: (data: RentalBasicFormValues) => void;
  defaultValues?: Partial<RentalBasicFormValues>;
  isEditMode?: boolean;
}

export function RentalBasicStep({ onSubmit, defaultValues, isEditMode: _isEditMode }: RentalBasicStepProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => getRentalBasicSchema(t), [t]);

  const form = useForm<RentalBasicFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
  });
  console.log(_isEditMode)

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [defaultValues?.name, defaultValues?.description]);

  // Avisa con un error puntual cuando se bloquea un carácter al escribir/pegar.
  const reportTextBlocked =
    (name: keyof RentalBasicFormValues) => (char: string) => {
      form.setError(
        name,
        { type: "manual", message: textBlockedMessage(t, char) },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addRental.basic.name")}</FormLabel>
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
                    placeholder={t("dashboard.addRental.basic.namePlaceholder")}
                    className={cn(
                      "focus:ring-0",
                      fieldState.error
                        ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500"
                        : "focus:border-black dark:focus:border-white border-gray-200 dark:border-gray-800",
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addRental.basic.description")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={5}
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
                    placeholder={t("dashboard.addRental.basic.descriptionPlaceholder")}
                    className={cn(
                      "border-gray-200 dark:border-gray-800",
                      fieldState.error &&
                        "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
                    )}
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
