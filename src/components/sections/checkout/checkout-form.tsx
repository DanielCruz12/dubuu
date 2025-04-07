"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  checkoutFormSchema,
  CheckoutFormValues,
} from "@/schemas/checkout-schema";
import ContactForm from "./forms/contact-form";
import ShippingForm from "./forms/shipping-form";
import PaymentMethodForm from "./forms/payment-form";

export default function CheckoutForm() {
  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "SV",
      paymentMethod: "credit",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvc: "",
    },
    mode: "onChange",
  });

  function onSubmit(values: CheckoutFormValues) {
    console.log(values);
    // En una aplicación real, aquí procesarías el pago
  }

  return (
    <FormProvider {...methods}>
      <h1 className="text-3xl font-bold mb-2">Finalizar Compra</h1>
      <p className="text-slate-500 mb-8">
        Complete sus datos para procesar su pedido
      </p>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <ContactForm />
        <ShippingForm />
        <PaymentMethodForm />
      </form>
    </FormProvider>
  );
}
