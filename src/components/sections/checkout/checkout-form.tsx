"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  checkoutFormSchema,
  CheckoutFormValues,
} from "@/schemas/checkout-schema";
import ContactForm from "./forms/contact-form";
import ShippingForm from "./forms/shipping-form";
import PaymentMethodForm from "./forms/payment-form";
import { useCreate3DSTransactionMutation } from "@/redux/slices/payment/payment-link";
import confetti from "canvas-confetti";

export default function CheckoutForm({
  bookingData,
}: {
  bookingData: {
    datetime: string;
    tickets: { adult: number };
    addons: string[];
    total: number;
  } | null;
}) {
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

  // ✅ Hook correcto fuera de onSubmit
  const [create3DSTransaction, { isLoading }] =
    useCreate3DSTransactionMutation();

  async function onSubmit(values: any) {
    if (!bookingData) {
      console.error("No hay datos de reserva");
      return;
    }

    const payload = {
      ...values,
      ...bookingData,
    };

    try {
      const response = await create3DSTransaction(payload).unwrap();
      console.log("Respuesta:", response);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error) {
      console.error("Error al procesar el pago:", error);
    }
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
        <PaymentMethodForm isLoading={isLoading} />
      </form>
    </FormProvider>
  );
}
