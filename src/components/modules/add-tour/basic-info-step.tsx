"use client";

import { useMemo } from "react";
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
import { scrollToFirstError } from "./utils";
import { countries } from "@/utils/data";
import { useLanguage } from "@/lib/i18n-context";

interface BasicInfoStepProps {
  onSubmit: (data: BasicInfoFormValues) => void;
  defaultValues?: Partial<BasicInfoFormValues>;
}

export function BasicInfoStep({ onSubmit, defaultValues }: BasicInfoStepProps) {
  const { t } = useLanguage();
  const basicInfoSchema = useMemo(() => getBasicInfoSchema(t), [t]);

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      departure_point: defaultValues?.departure_point || "",
      address: defaultValues?.address || "",
      country: defaultValues?.country || "",
      max_people: defaultValues?.max_people || undefined,
      duration: defaultValues?.duration || undefined,
    },
  });

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
      <form className="space-y-4" onSubmit={handleSubmit}>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white">
                      <SelectValue
                        placeholder={t("dashboard.addTour.basicInfo.countryPlaceholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries
                      .sort((a, b) => a.orden - b.orden)
                      .map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.nombre}
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
