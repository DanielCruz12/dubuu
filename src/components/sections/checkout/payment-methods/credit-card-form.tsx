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
import type { CheckoutFormValues } from "@/schemas/checkout-schema";
import Image from "next/image";

// Función para formatear el número de tarjeta con espacios
const formatCreditCardNumber = (value: string) => {
  if (!value) return value;
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ");
  } else {
    return value;
  }
};

// Función para formatear la fecha de expiración
const formatExpiryDate = (value: string) => {
  if (!value) return value;
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }

  return v;
};

export default function CreditCardForm() {
  const { control, setValue } = useFormContext<CheckoutFormValues>();

  return (
    <div className="rounded-lg p-4 border">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-slate-500">Tarjetas aceptadas</div>
        <div className="flex space-x-2">
          <Image src={"/tarjetas.svg"} width={60} height={60} alt="tarjetas" />
        </div>
      </div>

      <FormField
        control={control}
        name="cardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Tarjeta</FormLabel>
            <FormControl>
              <Input
                placeholder="4242 4242 4242 4242"
                value={field.value}
                onChange={(e) => {
                  const formatted = formatCreditCardNumber(e.target.value);
                  setValue("cardNumber", formatted);
                }}
                maxLength={19}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="cardName"
        render={({ field }) => (
          <FormItem className="mt-4">
            <FormLabel>Nombre en la Tarjeta</FormLabel>
            <FormControl>
              <Input placeholder="Juan Pérez" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <FormField
          control={control}
          name="cardExpiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Expiración</FormLabel>
              <FormControl>
                <Input
                  placeholder="MM/YY"
                  value={field.value}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setValue("cardExpiry", formatted);
                  }}
                  maxLength={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="cardCvc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CVC</FormLabel>
              <FormControl>
                <Input
                  placeholder="123"
                  value={field.value}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setValue("cardCvc", value);
                  }}
                  maxLength={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
