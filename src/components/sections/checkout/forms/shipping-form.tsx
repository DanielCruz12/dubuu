"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/lib/i18n-context";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckoutFormValues } from "@/schemas/checkout-schema";
import { countries } from "@/utils/data";
import { getCountryById, getRegionById } from "@/utils";

export default function ShippingForm() {
  const { t } = useLanguage();
  const { control, watch, setValue } = useFormContext<CheckoutFormValues>();

  const selectedCountry = watch("country");

  // Update zipCode when region changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "state" && value.state && value.country) {
        const region = getRegionById(value.country, value.state);
        if (region && region.codigoPostal) {
          setValue("zipCode", region.codigoPostal);
        } else {
          setValue("zipCode", "");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  return (
    <Card className="overflow-hidden pb-4">
      <CardHeader className="pb-8">
        <CardTitle className="text-xl">Dirección</CardTitle>
        <CardDescription>Ingresa tu dirección.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input
                  placeholder="Calle Principal 123"
                  {...field}
                  className="transition-all duration-200 "
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("home.checkout.address.country")}</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("state", "");
                    setValue("zipCode", "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all duration-200 ">
                      <SelectValue placeholder={t("home.checkout.address.selectCountry")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("home.checkout.address.region")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all duration-200 ">
                      <SelectValue placeholder={t("home.checkout.address.selectRegion")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedCountry &&
                      getCountryById(selectedCountry)?.regiones.map(
                        (region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {getCountryById(selectedCountry)?.nombre} -{" "}
                            {region.nombre}
                          </SelectItem>
                        )
                      )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("home.checkout.address.city")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("home.checkout.address.placeholderCity")}
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
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("home.checkout.address.zipCode")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("home.checkout.address.placeholderZip")}
                    {...field}
                    className="transition-all duration-200 "
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
