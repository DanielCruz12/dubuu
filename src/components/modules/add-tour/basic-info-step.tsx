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
import { useLanguage } from "@/lib/i18n-context";
import { getCountrySelectOptions } from "@/lib/country-options";

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

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      scrollToFirstError(errors);
    }
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
                <FormLabel>{t("dashboard.addTour.basicInfo.name")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("dashboard.addTour.basicInfo.namePlaceholder")}
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addTour.basicInfo.description")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t("dashboard.addTour.basicInfo.descriptionPlaceholder")}
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white min-h-[100px]"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departure_point"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.basicInfo.departure_point")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("dashboard.addTour.basicInfo.departure_pointPlaceholder")}
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_people"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.basicInfo.max_people")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={t("dashboard.addTour.basicInfo.max_peoplePlaceholder")}
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addTour.basicInfo.address")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("dashboard.addTour.basicInfo.addressPlaceholder")}
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.basicInfo.country")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white">
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.basicInfo.duration")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={t("dashboard.addTour.basicInfo.durationPlaceholder")}
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
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
