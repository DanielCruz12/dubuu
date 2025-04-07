"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { CheckoutFormValues } from "@/schemas/checkout-schema";
import CreditCardForm from "../payment-methods/credit-card-form";
import Image from "next/image";

export default function PaymentMethodForm() {
  const { control, watch, setValue } = useFormContext<CheckoutFormValues>();
  const [paymentTab, setPaymentTab] = useState("credit");

  // Watch for payment method changes
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (paymentMethod) {
      setPaymentTab(paymentMethod);
    }
  }, [paymentMethod]);

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className=" pb-8">
        <CardTitle className="text-xl">Método de Pago</CardTitle>
        <CardDescription>
          Selecciona tu método de pago preferido.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <FormField
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setPaymentTab(value);

                    // Reset credit card fields if not using credit card
                    if (value !== "credit") {
                      setValue("cardNumber", "");
                      setValue("cardName", "");
                      setValue("cardExpiry", "");
                      setValue("cardCvc", "");
                    }
                  }}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="col-span-1">
                    <FormItem className="flex flex-col space-y-1">
                      <FormControl>
                        <RadioGroupItem
                          value="credit"
                          className="peer sr-only"
                          id="credit"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="credit"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <CreditCard className="mb-3 h-6 w-6" />
                        Tarjeta de Crédito
                      </FormLabel>
                    </FormItem>
                  </div>

                  <div className="col-span-1">
                    <FormItem className="flex flex-col space-y-1">
                      <FormControl>
                        <RadioGroupItem
                          value="googlepay"
                          className="peer sr-only"
                          id="googlepay"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="googlepay"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Image width={100} height={100} src={"/Google-Pay-logo.png"} alt="google-pay" />
                      </FormLabel>
                    </FormItem>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Tabs value={paymentTab} className="mt-6">
          <TabsContent value="credit">
            <CreditCardForm />
          </TabsContent>
          <TabsContent value="googlepay">google form</TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className=" pt-8">
        <Button size={"lg"} type="submit" className="w-full text-base transition-all duration-300 py-2">
          Completar Pedido
        </Button>
      </CardFooter>
    </Card>
  );
}
