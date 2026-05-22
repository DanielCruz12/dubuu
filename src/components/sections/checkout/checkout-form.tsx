"use client";
import { useEffect, useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useRouter } from "next/navigation";
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
import {
  useCreateBookingMutation,
  bookingsApiSlice,
} from "@/redux/slices/booking/booking-slice";
import { useDispatch } from "react-redux";
import { useOnPaymentCompleted } from "@/contexts/socket-context";
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "@/redux/slices/user/user-slice";
import { useUser } from "@clerk/nextjs";
import { isTestCard } from "./card-validation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { CreditCard, X } from "lucide-react";

export default function CheckoutForm({
  setShowPaymentStep,
  bookingData,
}: {
  bookingData: {
    datetime: string;
    tickets: { adult: number; children: number };
    addons: string[];
    total: number;
    user_id: string;
    product_id: string;
  } | null;
  setShowPaymentStep: (show: boolean) => void;
}) {
  const { t } = useLanguage();
  const user = useUser();
  const router = useRouter();
  const dispatch = useDispatch();

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
      paymentMethod: "blink",
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

  const [blinkModalOpen, setBlinkModalOpen] = useState(false);
  const [blinkResponse, setBlinkResponse] = useState<{
    paymentRequest: string;
    idTransaccion: string;
    amount: number;
  } | null>(null);
  const [copiedBlink, setCopiedBlink] = useState(false);
  const [invoiceExpiresSeconds, setInvoiceExpiresSeconds] = useState(0);

  // Countdown 3 min cuando se abre el modal Lightning; al llegar a 0 se cierra
  useEffect(() => {
    if (!blinkModalOpen || !blinkResponse) return;
    setInvoiceExpiresSeconds(180);
    const interval = setInterval(() => {
      setInvoiceExpiresSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setBlinkModalOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [blinkModalOpen, blinkResponse]);

  const { data: currentUser } = useGetUserQuery(bookingData?.user_id ?? "", {
    skip: !bookingData?.user_id,
  });

  useOnPaymentCompleted(() => {
    setBlinkModalOpen(false);
    setBlinkResponse(null);
    toast.success(t("home.checkout.toast.paymentCompletedSuccess"), {
      action: {
        label: t("home.checkout.toast.viewMyBookings"),
        onClick: () => router.push("/account/bookings"),
      },
    });
    dispatch(
      bookingsApiSlice.util.invalidateTags([{ type: "Bookings", id: "USER_LIST" }])
    );
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
        paymentMethod: "blink",
        cardNumber: "",
        cardName: "",
        cardExpiry: "",
        cardCvc: "",
      });
    }
  }, [currentUser, methods, user.user?.emailAddresses]);

  async function onSubmit(values: CheckoutFormValues) {
    if (!bookingData) {
      console.error("No hay datos de reserva");
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(values.phone);
    if (!parsedPhone) {
      return;
    }

    if (
      values.paymentMethod === "credit" &&
      values.cardNumber &&
      isTestCard(values.cardNumber)
    ) {
      toast.error(t("home.checkout.toast.invalidCard"), {
        description: t("home.checkout.toast.invalidCardDesc"),
      });
      return;
    }

    const paymentMethod = values.paymentMethod;

    // Actualizar usuario: con blink solo contacto (opcional); con tarjeta también dirección
    const userUpdateData: Parameters<typeof updateUser>[0]["data"] = {
      email: values.email,
      username: user.user?.username ?? "",
      first_name: values.firstName,
      last_name: values.lastName,
      phone_number: parsedPhone.number,
    };
    if (paymentMethod !== "blink") {
      userUpdateData.address = values.address;
      userUpdateData.city = values.city;
      userUpdateData.id_region = values.state;
      userUpdateData.zip_code = values.zipCode;
      userUpdateData.country = values.country;
    }
    try {
       await updateUser({
        id: bookingData.user_id,
        data: userUpdateData,
      }).unwrap(); 
    } catch (err: unknown) {
      console.error("Error al actualizar usuario", err);
      toast.error(
        (err as Error)?.message || t("home.checkout.toast.updateError"),
      );
      return;
    }

    if (paymentMethod === "blink") {
      const blinkPayload = {
        total: bookingData.total,
        user_id: bookingData.user_id,
        product_id: bookingData.product_id,
        tickets: bookingData.tickets.adult + (bookingData.tickets.children ?? 0),
        tour_date_id: bookingData.datetime,
      };
      try {
        const response = await createBlinkPayment(blinkPayload).unwrap();
        const paymentRequest =
          (response as { paymentRequest?: string }).paymentRequest ?? "";
        const idTransaccion =
          (response as { idTransaccion?: string }).idTransaccion ?? "";
        const amount =
          (response as { amount?: number }).amount ?? bookingData.total;
        setBlinkResponse({ paymentRequest, idTransaccion, amount });
        setBlinkModalOpen(true);
        toast.success(t("home.checkout.toast.blinkReady"));
      } catch (err: unknown) {
        toast.error(
          (err as Error)?.message || t("home.checkout.toast.paymentError"),
        );
      }
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
          is_live: true,
          tickets: bookingData.tickets.adult + (bookingData.tickets.children ?? 0),
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
        error: (err) =>
          err?.data?.message || t("home.checkout.toast.paymentError"),
      },
    );
  }

  const lightningUri = blinkResponse
    ? `lightning:${blinkResponse.paymentRequest}`
    : "";
  const copyPaymentRequest = () => {
    if (!lightningUri) return;
    navigator.clipboard.writeText(lightningUri);
    setCopiedBlink(true);
    toast.success(t("home.checkout.payment.blinkModal.copied"));
    setTimeout(() => setCopiedBlink(false), 2000);
  };

  const paymentMethod = methods.watch("paymentMethod");

  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);

  const legalLinkClass =
    "font-medium underline underline-offset-4 text-blue-600 hover:text-blue-800 dark:text-foreground dark:hover:text-primary transition-colors";

  return (
    <FormProvider {...methods}>
      <h1 className="text-xl md:text-2xl font-semibold mb-1">
        {t("home.checkout.title")}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {t("home.checkout.description")}
      </p>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <PaymentMethodForm />
        <ContactForm />
        {paymentMethod !== "blink" && <ShippingForm />}

        <div>
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              disabled={isLoading}
              type="submit"
              className="w-full text-base py-2"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isLoading
                ? t("home.checkout.payment.processing")
                : t("home.checkout.payment.proceedToPay")}
            </Button>
            <Button
              onClick={() => setShowPaymentStep(false)}
              type="button"
              variant="destructive"
              className="w-full text-base py-2 font-semibold"
            >
              <X className="h-4 w-4 mr-2 shrink-0" />
              {t("home.checkout.payment.cancel")}
            </Button>
          </div>
          <div className="mt-4 space-y-2 px-2 text-center text-xs leading-relaxed text-muted-foreground sm:px-6">
            <p>
              <span className="font-medium text-foreground">
                {t("home.checkout.payment.termsAgreeButton")}
              </span>{" "}
              {t("home.checkout.payment.termsAgreeAfter")}
              <Link href="/terms" className={legalLinkClass}>
                {t("home.checkout.payment.termsLink")}
              </Link>
              .
            </p>
            <p>
              <button
                type="button"
                onClick={() => setCancellationModalOpen(true)}
                className={legalLinkClass}
              >
                {t("home.bookingForm.cancellationPolicies")}
              </button>
            </p>
          </div>
        </div>
      </form>

      <Dialog open={cancellationModalOpen} onOpenChange={setCancellationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("home.bookingForm.cancellationModal.title")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("home.bookingForm.cancellationModal.intro")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>{t("home.bookingForm.cancellationModal.intro")}</p>
            <ul className="list-inside list-disc space-y-2 pl-1">
              <li>{t("home.bookingForm.cancellationModal.fullRefund")}</li>
              <li>{t("home.bookingForm.cancellationModal.partialRefund")}</li>
              <li>{t("home.bookingForm.cancellationModal.noRefund")}</li>
            </ul>
            <p>{t("home.bookingForm.cancellationModal.changes")}</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={blinkModalOpen} onOpenChange={setBlinkModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-md">
              {t("home.checkout.payment.blinkModal.title")}
              {blinkResponse != null && (
                <span className="font-normal ">
                  {" "}
                  - {blinkResponse.amount} US$
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {t("home.checkout.payment.blinkModal.scanQr")}
            </DialogDescription>
          </DialogHeader>
          {blinkResponse && (
            <div className="space-y-4 min-w-0 overflow-hidden">
              <p className="text-sm text-center text-muted-foreground">
                {invoiceExpiresSeconds > 0 ? (
                  <>
                    Invoice expires in{" "}
                    <span className="font-medium text-foreground">
                      {Math.floor(invoiceExpiresSeconds / 60)} Minute
                      {Math.floor(invoiceExpiresSeconds / 60) !== 1
                        ? "s"
                        : ""}{" "}
                      {invoiceExpiresSeconds % 60} Second
                      {invoiceExpiresSeconds % 60 !== 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <span className="font-medium text-amber-500">
                    Invoice expired
                  </span>
                )}
              </p>
              <div className="flex flex-col items-center gap-2 min-w-0">
                <QRCodeSVG
                  value={lightningUri}
                  size={220}
                  level="M"
                  marginSize={2}
                  className="rounded-lg border border-border bg-white p-2 shrink-0"
                />
                <button
                  type="button"
                  onClick={copyPaymentRequest}
                  className="block w-full min-w-0 max-w-full text-left text-xs text-muted-foreground font-mono bg-muted/50 px-3 rounded cursor-pointer hover:bg-muted/60 transition-colors select-none touch-manipulation overflow-hidden"
                  title={
                    copiedBlink
                      ? t("home.checkout.payment.blinkModal.copied")
                      : "Toca para copiar"
                  }
                >
                  <span
                    className="block w-full break-all overflow-hidden text-xs leading-tight"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      maxHeight: "2.5rem",
                    }}
                  >
                    {lightningUri}
                  </span>
                </button>
              </div>

              <DialogFooter className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBlinkModalOpen(false)}
                >
                  {t("home.checkout.payment.blinkModal.close")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={copyPaymentRequest}
                >
                  {copiedBlink
                    ? t("home.checkout.payment.blinkModal.copied")
                    : t("home.checkout.payment.blinkModal.copy")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
