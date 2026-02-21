"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/lib/i18n-context";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckoutFormValues } from "@/schemas/checkout-schema";
import CreditCardForm from "../payment-methods/credit-card-form";
import Image from "next/image";

export default function PaymentMethodForm() {
  const { t } = useLanguage();
  const { control, watch, setValue } = useFormContext<CheckoutFormValues>();
  const [paymentTab, setPaymentTab] = useState("blink");

  // Watch for payment method changes
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (paymentMethod) {
      setPaymentTab(paymentMethod);
    }
  }, [paymentMethod]);

  return (
    <Card className="overflow-hidden border pb-4">
      <CardHeader className=" pb-8">
        <CardTitle className="text-xl">
          {t("home.checkout.payment.title")}
        </CardTitle>
        <CardDescription>
          {t("home.checkout.payment.description")}
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

                    // Reset credit card fields when not using credit card
                    if (value !== "credit") {
                      setValue("cardNumber", "");
                      setValue("cardName", "");
                      setValue("cardExpiry", "");
                      setValue("cardCvc", "");
                    }
                  }}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="col-span-1">
                    <FormItem className="flex flex-col space-y-1">
                      <FormControl>
                        <RadioGroupItem
                          value="blink"
                          className="peer sr-only"
                          id="blink"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="blink"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <div className=" flex  items-center justify-center shrink-0">
                          <Image
                            src="/btc-logo.svg"
                            alt="Bitcoin"
                            className="object-contain max-w-full"
                            width={112}
                            height={112}
                          />
                        </div>
                        <span className="text-center pt-2 font-medium">
                          {t("home.checkout.payment.bitcoinLightning")}
                        </span>
                      </FormLabel>
                    </FormItem>
                  </div>

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
                        <div className=" flex  items-center justify-center shrink-0">
                          <Image
                            src={"/tarjetas.svg"}
                            className="object-contain max-w-full"
                            width={112}
                            height={112}
                            alt="tarjetas"
                          />
                        </div>
                        <span className="text-center pt-2 font-medium">
                          {t("home.checkout.payment.creditCard")}
                        </span>
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
          <TabsContent value="blink">
            <div className="rounded-lg border border-muted bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                {t("home.checkout.payment.bitcoinLightning")}
              </p>
              <p>{t("home.checkout.payment.blinkDescription")}</p>
            </div>
          </TabsContent>
          <TabsContent value="googlepay">google form</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
