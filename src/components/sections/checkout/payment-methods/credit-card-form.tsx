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
import { AlertTriangle, Calendar, CreditCard, Lock } from "lucide-react";
import {
  formatCreditCardNumber,
  formatExpiryDate,
  getCardType,
  isTestCard,
} from "../card-validation";
import { useEffect, useState } from "react";

export default function CreditCardForm() {
  const { control, setValue, trigger, watch } =
    useFormContext<CheckoutFormValues>();
  const [cardType, setCardType] = useState<string>("");
  const [isTestCardWarning, setIsTestCardWarning] = useState(false);

  const cardNumber = watch("cardNumber");
  useEffect(() => {
    // Verificar si es una tarjeta de prueba
    if (cardNumber) {
      setIsTestCardWarning(isTestCard(cardNumber));
    } else {
      setIsTestCardWarning(false);
    }
  }, [cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCreditCardNumber(value);
    setValue("cardNumber", formatted);

    // Identify card type
    const type = getCardType(value);
    setCardType(type);

    // Validate after formatting
    trigger("cardNumber");
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatExpiryDate(value);
    setValue("cardExpiry", formatted);

    // Validate after formatting
    trigger("cardExpiry");
  };

  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setValue("cardCvc", value);

    // Validate after formatting
    trigger("cardCvc");
  };
  return (
    <div className="rounded-lg p-4 border">
      <FormField
        control={control}
        name="cardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Tarjeta</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="4242 4242 4242 4242"
                  value={field.value}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  className={`pl-10 ${isTestCardWarning ? "border-yellow-500 focus:ring-yellow-500" : ""}`}
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {cardType && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium capitalize">
                    {cardType}
                  </span>
                )}
              </div>
            </FormControl>
            {isTestCardWarning && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>
                  Este número de tarjeta no es válido para pagos reales
                </span>
              </div>
            )}
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
                <div className="relative">
                  <Input
                    placeholder="MM/YY"
                    value={field.value}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
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
                <div className="relative">
                  <Input
                    placeholder="123"
                    value={field.value}
                    onChange={handleCVCChange}
                    maxLength={4}
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
