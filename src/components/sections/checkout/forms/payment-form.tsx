"use client";

import { useState, useEffect } from "react";
import {
  useFormContext,
  type ControllerRenderProps,
  type UseFormSetValue,
} from "react-hook-form";
import { useLanguage } from "@/lib/i18n-context";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutFormValues } from "@/schemas/checkout-schema";
import CreditCardForm from "../payment-methods/credit-card-form";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

function applyPaymentMethodChange(
  value: string,
  fieldOnChange: (v: string) => void,
  setPaymentTab: (v: string) => void,
  setValue: UseFormSetValue<CheckoutFormValues>,
) {
  fieldOnChange(value);
  setPaymentTab(value);
  if (value !== "credit") {
    setValue("cardNumber", "");
    setValue("cardName", "");
    setValue("cardExpiry", "");
    setValue("cardCvc", "");
  }
}

function useIsDesktopMd(): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setWide(mq.matches);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide;
}

function PaymentMethodRadioList({
  field,
  setPaymentTab,
  setValue,
  onPicked,
  t,
}: {
  field: ControllerRenderProps<CheckoutFormValues, "paymentMethod">;
  setPaymentTab: (v: string) => void;
  setValue: UseFormSetValue<CheckoutFormValues>;
  onPicked: () => void;
  t: (key: string) => string;
}) {
  return (
    <RadioGroup
      value={field.value}
      onValueChange={(value) => {
        applyPaymentMethodChange(value, field.onChange, setPaymentTab, setValue);
        onPicked();
      }}
      className="flex flex-col gap-4 pb-2"
    >
      <FormItem className="flex flex-col space-y-1">
        <FormControl>
          <RadioGroupItem
            value="blink"
            className="peer sr-only"
            id="checkout-pay-blink"
          />
        </FormControl>
        <FormLabel
          htmlFor="checkout-pay-blink"
          className="flex flex-row items-center gap-4 rounded-xl border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary cursor-pointer"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <Image
              src="/btc-logo.svg"
              alt=""
              className="object-contain"
              width={48}
              height={48}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-semibold">
              {t("home.checkout.payment.bitcoinLightning")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("home.checkout.payment.blinkDescription")}
            </span>
          </div>
        </FormLabel>
      </FormItem>
      <FormItem className="flex flex-col space-y-1">
        <FormControl>
          <RadioGroupItem
            value="credit"
            className="peer sr-only"
            id="checkout-pay-credit"
          />
        </FormControl>
        <FormLabel
          htmlFor="checkout-pay-credit"
          className="flex flex-row items-center gap-4 rounded-xl border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary cursor-pointer"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <Image
              src="/tarjetas.svg"
              className="object-contain"
              width={48}
              height={48}
              alt=""
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-semibold">
              {t("home.checkout.payment.creditCard")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("home.checkout.payment.cardOptionHint")}
            </span>
          </div>
        </FormLabel>
      </FormItem>
    </RadioGroup>
  );
}

export default function PaymentMethodForm() {
  const { t } = useLanguage();
  const { control, watch, setValue } = useFormContext<CheckoutFormValues>();
  const [paymentTab, setPaymentTab] = useState("blink");
  const [pickerOpen, setPickerOpen] = useState(false);
  const isDesktop = useIsDesktopMd();

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (paymentMethod) {
      setPaymentTab(paymentMethod);
    }
  }, [paymentMethod]);

  const methodSummary =
    paymentMethod === "credit"
      ? t("home.checkout.payment.creditCard")
      : t("home.checkout.payment.bitcoinLightning");

  return (
    <Card className="overflow-hidden pb-4">
      <CardContent className="px-4 pt-4 pb-0">
        <FormField
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-base font-medium">
                {t("home.checkout.payment.title")}
              </FormLabel>

              <FormControl>
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPickerOpen(true)}
                    className="w-full h-auto min-h-[3.25rem] justify-between gap-3 px-4 py-3 text-left font-normal border-2 rounded-xl"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 min-w-[5rem] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/60 px-2">
                        {paymentMethod === "credit" ? (
                          <Image
                            src="/tarjetas.svg"
                            alt=""
                            width={112}
                            height={28}
                            className="h-auto max-h-7 w-auto max-w-[5rem] object-contain object-center"
                          />
                        ) : (
                          <Image
                            src="/btc-logo.svg"
                            alt=""
                            width={96}
                            height={96}
                            className="h-auto max-h-7 w-auto max-w-[5rem] object-contain object-center"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5 text-left">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t("home.checkout.payment.paymentMethodChangeHint")}
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">
                          {methodSummary}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </Button>

                  {isDesktop ? (
                    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                      <DialogContent className="sm:max-w-md gap-0 overflow-hidden p-0 pt-6">
                        <DialogHeader className="px-6 pb-2 text-left">
                          <DialogTitle>
                            {t("home.checkout.payment.paymentMethodSheetTitle")}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[min(70vh,420px)] overflow-y-auto px-6 pb-6">
                          <PaymentMethodRadioList
                            field={field}
                            setPaymentTab={setPaymentTab}
                            setValue={setValue}
                            onPicked={() => setPickerOpen(false)}
                            t={t}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
                      <SheetContent
                        side="bottom"
                        className="rounded-t-[1.25rem] max-h-[min(88dvh,560px)] w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6"
                      >
                        <SheetHeader className="pb-4 text-left space-y-1">
                          <SheetTitle className="text-lg">
                            {t("home.checkout.payment.paymentMethodSheetTitle")}
                          </SheetTitle>
                        </SheetHeader>
                        <PaymentMethodRadioList
                          field={field}
                          setPaymentTab={setPaymentTab}
                          setValue={setValue}
                          onPicked={() => setPickerOpen(false)}
                          t={t}
                        />
                      </SheetContent>
                    </Sheet>
                  )}
                </>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {paymentTab === "credit" ? (
          <div className="mt-4">
            <CreditCardForm />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
