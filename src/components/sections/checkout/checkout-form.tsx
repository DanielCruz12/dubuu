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
import { useState } from "react";
import { toast } from "sonner";

export default function CheckoutForm({
  bookingData,
}: {
  bookingData: {
    datetime: string;
    tickets: { adult: number };
    addons: string[];
    total: number;
    user_id: string;
    product_id: string;
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

  const [redirecting, setRedirecting] = useState(false);
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
      user_id: bookingData.user_id,
      product_id: bookingData.product_id,
    };

    try {
      const response = await create3DSTransaction(payload).unwrap();
      if (response?.urlCompletarPago3Ds) {
        setRedirecting(true);
        setTimeout(() => {
          window.location.href = response.urlCompletarPago3Ds;
        }, 1500);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        console.error("No se pudo obtener la URL de redirección");
      }
    } catch (error: any) {
      console.error("Error al procesar el pago:", error);

      toast.error("Pago no realizado", {
        description: error.data?.message || "Error desconocido",
      });
    }
  }

  if (redirecting) {
    return (
      <div className="text-center py-16">
        <div className="text-2xl font-semibold mb-4">
          Redirigiendo al banco...
        </div>
        <p className="text-slate-500 mb-2">
          Estamos verificando tu tarjeta con el sistema de seguridad 3DS.
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto" />
      </div>
    );
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
        <PaymentMethodForm isLoading={isLoading || redirecting} />
      </form>
    </FormProvider>
  );
}
