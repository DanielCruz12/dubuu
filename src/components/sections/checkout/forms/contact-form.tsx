"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CheckoutFormValues } from "@/schemas/checkout-schema";
import { PhoneInputComponent } from "@/components/phone-input";
import { useLanguage } from "@/lib/i18n-context";

export default function ContactForm() {
  const { t } = useLanguage();
  const { control } = useFormContext<CheckoutFormValues>();

  return (
    <Card className="overflow-hidden border pb-4">
      <CardHeader className="pb-8">
        <CardTitle className="text-xl">{t("home.checkout.contact.title")}</CardTitle>
        <CardDescription>
          {t("home.checkout.contact.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("home.checkout.contact.firstName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("home.checkout.contact.placeholderFirst")}
                    {...field}
                    className="transition-all duration-200 "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("home.checkout.contact.lastName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("home.checkout.contact.placeholderLast")}
                    {...field}
                    className="transition-all duration-200 "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("home.checkout.contact.phone")}</FormLabel>
                <FormControl>
                  <PhoneInputComponent
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    defaultCountry="SV"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
