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

export default function ContactForm() {
  const { control } = useFormContext<CheckoutFormValues>();

  return (
    <Card className="overflow-hidden border pb-4">
      <CardHeader className="pb-8">
        <CardTitle className="text-xl">Información de Contacto</CardTitle>
        <CardDescription>
          Ingresa tus datos de contacto para la confirmación del pedido.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Juan"
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
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pérez"
                    {...field}
                    className="transition-all duration-200 "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="juan.perez@ejemplo.com"
                    type="email"
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
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
