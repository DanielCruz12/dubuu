"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { parsePhoneNumberFromString } from "libphonenumber-js";
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
import { useCreateBookingMutation } from "@/redux/slices/booking/booking-slice";

export default function CheckoutForm({
  setShowPaymentStep,
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
  setShowPaymentStep: (show: boolean) => void;
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

  const [createBooking] = useCreateBookingMutation();

  async function onSubmit(values: any) {
    if (!bookingData) {
      console.error("No hay datos de reserva");
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(values.phone);
    if (!parsedPhone) {
      return;
    }

    const payload = {
      ...bookingData,
      ...values,
      phone: parsedPhone.nationalNumber,
    };

    toast.promise(
      (async () => {
        const response = await create3DSTransaction(payload).unwrap();

        const bookingPayload = {
          ...bookingData,
          user_id: bookingData.user_id,
          product_id: bookingData.product_id,
          tickets: bookingData.tickets.adult,
          total: bookingData.total,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
          id_region: values.state,
          country: values.country,
          zip_code: values.zipCode,
          paymentMethod: values.paymentMethod,
          is_live: true,
          idTransaccion: response.idTransaccion,
          urlCompletarPago3Ds: response.urlCompletarPago3Ds,
        };

        await createBooking(bookingPayload).unwrap();

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
          throw new Error("No se pudo obtener la URL de redirección");
        }
      })(),
      {
        loading: "Procesando pago...",
        success: "¡Reserva creada! Redirigiendo al banco...",
        error: (err) => err?.data?.message || "Error al procesar el pago",
      }
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
        <PaymentMethodForm
          setShowPaymentStep={setShowPaymentStep}
          isLoading={isLoading || redirecting}
        />
      </form>
    </FormProvider>
  );
}
