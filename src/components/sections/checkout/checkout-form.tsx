"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useLanguage } from "@/lib/i18n-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  checkoutFormSchema,
  CheckoutFormValues,
} from "@/schemas/checkout-schema";
import ContactForm from "./forms/contact-form";
import ShippingForm from "./forms/shipping-form";
import PaymentMethodForm from "./forms/payment-form";
import {
  useCreate3DSTransactionMutation,
  useCreateBlinkPaymentMutation,
} from "@/redux/slices/payment/payment-link";
import { toast } from "sonner";
import { useCreateBookingMutation } from "@/redux/slices/booking/booking-slice";
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "@/redux/slices/user/user-slice";
import { useUser } from "@clerk/nextjs";
import { isTestCard } from "./card-validation";

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
  const { t } = useLanguage();
  const user = useUser();

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user.user?.emailAddresses[0]?.emailAddress ?? "",
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

  const [create3DSTransaction, { isLoading: is3DSLoading }] =
    useCreate3DSTransactionMutation();
  const [createBlinkPayment, { isLoading: isBlinkLoading }] =
    useCreateBlinkPaymentMutation();
  const [updateUser] = useUpdateUserMutation();

  const [createBooking] = useCreateBookingMutation();
  const isLoading = is3DSLoading || isBlinkLoading;

  const { data: currentUser } = useGetUserQuery(bookingData?.user_id ?? "", {
    skip: !bookingData?.user_id,
  });

  useEffect(() => {
    if (currentUser) {
      methods.reset({
        firstName: currentUser.first_name ?? "",
        lastName: currentUser.last_name ?? "",
        email: user.user?.emailAddresses[0]?.emailAddress ?? "",
        phone: currentUser.phone_number ?? "",
        address: currentUser.address ?? "",
        city: currentUser.city ?? "",
        state: currentUser.id_region ?? "",
        zipCode: currentUser.zip_code ?? "",
        country: currentUser.country ?? "SV",
        paymentMethod: "credit",
        cardNumber: "",
        cardName: "",
        cardExpiry: "",
        cardCvc: "",
      });
    }
  }, [currentUser, methods, user.user?.emailAddresses]);

  async function onSubmit(values: any) {
    if (!bookingData) {
      console.error("No hay datos de reserva");
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(values.phone);
    if (!parsedPhone) {
      return;
    }

    if (values.paymentMethod === "credit" && isTestCard(values.cardNumber)) {
      toast.error(t("home.checkout.toast.invalidCard"), {
        description: t("home.checkout.toast.invalidCardDesc"),
      });
      return;
    }

    const payload = {
      ...bookingData,
      ...values,
      phone: parsedPhone.nationalNumber,
    };

    try {
      await updateUser({
        id: bookingData.user_id,
        data: {
          email: values.email,
          username: user.user?.username ?? "",
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: parsedPhone.number,
          address: values.address,
          city: values.city,
          id_region: values.state,
          zip_code: values.zipCode,
          country: values.country,
        },
      }).unwrap();
    } catch (err: any) {
      console.error("Error al actualizar usuario", err);
      toast.error(
        err?.data?.message || t("home.checkout.toast.updateError")
      );
      return;
    }

    const paymentMethod = values.paymentMethod;

    if (paymentMethod === "blink") {
      toast.promise(
        (async () => {
          const response = await createBlinkPayment(payload).unwrap();

          const bookingPayload = {
            ...bookingData,
            user_id: bookingData.user_id,
            product_id: bookingData.product_id,
            is_live: true,
            tickets: bookingData.tickets.adult,
            total: bookingData.total,
            tour_date_id: [bookingData.datetime],
            paymentMethod: "blink",
            idTransaccion: response.idTransaccion ?? "",
          };

          await createBooking(bookingPayload).unwrap();

          if (response?.paymentUrl) {
            setTimeout(() => {
              window.location.href = response.paymentUrl;
            }, 500);
          } else {
            throw new Error("No se pudo obtener la URL de pago Blink");
          }
        })(),
        {
          loading: t("home.checkout.toast.processing"),
          success: t("home.checkout.toast.redirecting"),
          error: (err) =>
            err?.data?.message ||
            t("home.checkout.toast.paymentError"),
        }
      );
      return;
    }

    toast.promise(
      (async () => {
        const response = await create3DSTransaction(payload).unwrap();

        const bookingPayload = {
          ...bookingData,
          user_id: bookingData.user_id,
          product_id: bookingData.product_id,
          is_live: true,
          tickets: bookingData.tickets.adult,
          total: bookingData.total,
          tour_date_id: [bookingData.datetime],
          paymentMethod: values.paymentMethod,
          idTransaccion: response.idTransaccion ?? "",
        };

        await createBooking(bookingPayload).unwrap();

        if (response?.urlCompletarPago3Ds) {
          setTimeout(() => {
            window.location.href = response?.urlCompletarPago3Ds ?? "";
          }, 1000);
        } else {
          throw new Error("No se pudo obtener la URL de redirección");
        }
      })(),
      {
        loading: t("home.checkout.toast.processing"),
        success: t("home.checkout.toast.redirecting"),
        error: (err) => err?.data?.message || t("home.checkout.toast.paymentError"),
      }
    );
  }

  return (
    <FormProvider {...methods}>
      <h1 className="text-3xl font-bold mb-2">{t("home.checkout.title")}</h1>
      <p className="text-slate-500 mb-8">
        {t("home.checkout.description")}
      </p>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <ContactForm />
        <ShippingForm />
        <PaymentMethodForm
          setShowPaymentStep={setShowPaymentStep}
          isLoading={isLoading}
        />
      </form>
    </FormProvider>
  );
}
