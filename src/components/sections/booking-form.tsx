/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import moment from "moment";
import "moment/locale/es";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarCheck, FileText } from "lucide-react";
import type { IProduct } from "@/types/product";
import { Separator } from "../ui/separator";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { isProductType } from "@/utils";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getHostEarningsFromFinalPrice } from "@/lib/price";

import "moment/locale/es";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { useLanguage } from "@/lib/i18n-context";
import { getProductDisplayPrice } from "@/utils/product-helpers";

function getBookingFormSchema(t: (key: string) => string) {
  return z.object({
    datetime: z.string().min(1, t("home.bookingForm.validation.datetimeRequired")),
    tickets: z.object({
      adult: z.coerce.number().min(1, t("home.bookingForm.validation.minOneTicket")),
    }),
    addons: z.array(z.enum(["lunch", "transport"])),
  });
}

type FormData = z.infer<ReturnType<typeof getBookingFormSchema>>;

export default function BookingForm({
  product,
  displayPrice,
  setShowPaymentStep,
  setBookingData,
  showPaymentStep,
  extraActionBelowBookNow,
}: {
  product: IProduct;
  displayPrice?: number;
  setShowPaymentStep: () => void;
  setBookingData: (data: {
    datetime: string;
    tickets: { adult: number };
    addons: string[];
    total: number;
    user_id: string;
    product_id: string;
  }) => void;
  showPaymentStep: boolean;
  extraActionBelowBookNow?: ReactNode;
}) {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const convert = formatUsd;
  const symbol = USD_SYMBOL;

  const dateLabelFormat =
    language === "es" ? "dddd, D [de] MMMM - h:mm A" : "dddd, MMM D - h:mm A";

  const [selectedDatePrice, setSelectedDatePrice] = useState<number | null>(
    null,
  );

  const fallbackPrice =
    typeof displayPrice === "number" && Number.isFinite(displayPrice)
      ? displayPrice
      : getProductDisplayPrice(product);

  const unitPrice =
    typeof selectedDatePrice === "number" && Number.isFinite(selectedDatePrice)
      ? selectedDatePrice
      : fallbackPrice;

  const datetimeRef = useRef<HTMLDivElement>(null);

  const [selectedDateAvailability, setSelectedDateAvailability] = useState<{
    maxPeople: number;
    peopleBooked: number;
    availableSpots: number;
  } | null>(null);

  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTour = isProductType(product, "tours");

  const availableDates = isTour
    ? (product.tour?.tour_dates ?? [])
        .filter(
          (dateObj) =>
            moment(dateObj.date).isAfter(moment()) &&
            (dateObj.status === undefined || dateObj.status === "active"),
        )
        .map((dateObj) => ({
          value: dateObj.id,
          label: moment(dateObj.date).locale(language).format(dateLabelFormat),
          maxPeople: dateObj.max_people,
          peopleBooked: dateObj.people_booked,
          availableSpots: dateObj.max_people - dateObj.people_booked,
          price: typeof dateObj.price === "number" ? dateObj.price : null,
        }))
    : [];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(getBookingFormSchema(t)),
    defaultValues: {
      datetime: "",
      tickets: { adult: 1 },
      addons: [],
    },
  });

  const watchData = watch();
  const adultTickets = watchData.tickets.adult;
  const baseForBreakdown = convert(unitPrice);
  const bookingBreakdown = getHostEarningsFromFinalPrice(
    baseForBreakdown,
    adultTickets,
  );

  const onSubmit = async () => {
    if (!user) {
      toast.error(t("home.bookingForm.toast.loginRequired"));
      return;
    }

    setBookingData({
      datetime: watchData.datetime,
      tickets: watchData.tickets,
      addons: watchData.addons,
      total: bookingBreakdown.userPays,
      user_id: user.id,
      product_id: product.id,
    });

    setShowPaymentStep();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (errors: any) => {
    if (errors.datetime) {
      datetimeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleReserveClick = () => {
    if (showPaymentStep) {
      return;
    }

    // Verificar si hay suficientes lugares disponibles
    if (
      selectedDateAvailability &&
      watchData.tickets.adult > selectedDateAvailability.availableSpots
    ) {
      toast.error(
        t("home.bookingForm.toast.spotsLeft").replace("{count}", String(selectedDateAvailability.availableSpots))
      );
      return;
    }

    handleSubmit(onSubmit, handleError)();
  };

  return (
    <>
    <div className="sticky top-4 rounded-lg px-2 max-w-md mx-auto">
      <h2 className="text-base font-semibold mb-4 hidden md:block">
        {t("home.bookingForm.title")} {product.name}
      </h2>

      <form className="space-y-6">
        <div ref={datetimeRef}>
          <Label>{t("home.bookingForm.datetimeLabel")}</Label>
          <Controller
            control={control}
            name="datetime"
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const selectedDate = availableDates.find(
                    (d) => d.value === value
                  );
                  if (selectedDate) {
                    setSelectedDateAvailability({
                      maxPeople: selectedDate.maxPeople,
                      peopleBooked: selectedDate.peopleBooked,
                      availableSpots: selectedDate.availableSpots,
                    });
                    setSelectedDatePrice(selectedDate.price);
                  } else {
                    setSelectedDatePrice(null);
                  }
                }}
                value={field.value}
              >
                <SelectTrigger className="mt-1 w-full mx-auto">
                  <SelectValue placeholder={t("home.bookingForm.datetimePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.length > 0 ? (
                    availableDates.map((d) => (
                      <SelectItem
                        key={d.value.toString()}
                        value={d.value.toString()}
                        disabled={showPaymentStep || d.availableSpots <= 0}
                      >
                        <div className="flex justify-between w-full">
                          <span>{d.label}</span>
                          <span
                            className={`ml-2 ${d.availableSpots <= 3 && d.availableSpots > 0 ? "text-amber-500 font-semibold" : d.availableSpots <= 0 ? "text-red-500 font-semibold" : "text-emerald-400"}`}
                          >
                            {d.availableSpots > 0
                              ? `(${d.availableSpots} ${t("home.bookingForm.available")})`
                              : `(${t("home.bookingForm.soldOut")})`}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-dates" disabled>
                      {t("home.bookingForm.noDates")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.datetime && (
            <p className="text-sm text-red-500">{errors.datetime.message}</p>
          )}
        </div>

        <div>
          <Label>{t("home.bookingForm.ticketsLabel")}</Label>
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mt-2">
            <span>{t("home.bookingForm.adults")}</span>
            <div className="flex items-center gap-2">
              {symbol}
              {convert(unitPrice)}
              <Controller
                control={control}
                name="tickets.adult"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={showPaymentStep || field.value <= 1}
                      onClick={() =>
                        field.onChange(Math.max(field.value - 1, 1))
                      }
                    >
                      –
                    </Button>
                    <span>{field.value}</span>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        showPaymentStep ||
                        !selectedDateAvailability ||
                        field.value >= selectedDateAvailability.availableSpots
                      }
                      onClick={() => {
                        if (!selectedDateAvailability) return;
                        const max = selectedDateAvailability.availableSpots;
                        const newValue = Math.min(field.value + 1, max);
                        field.onChange(newValue);
                      }}
                    >
                      +
                    </Button>
                  </div>
                )}
              />
            </div>
          </div>
          {errors.tickets?.adult && (
            <p className="text-sm text-red-500">
              {errors.tickets.adult.message}
            </p>
          )}
        </div>

        <div className="pt-4 border-t dark:border-muted space-y-3">
          <>
            <div className="flex justify-between text-sm">
              <span>
                {t("home.bookingForm.pricePerPerson")}{" "}
                {t("home.bookingForm.perPerson")}
              </span>
              <span>
                {symbol}
                {baseForBreakdown}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>{t("home.bookingForm.subtotal")}</span>
              <span>
                {symbol}
                {bookingBreakdown.userPays.toFixed(2)}
              </span>
            </div>
            <Separator className="my-3" />
            <div className="flex rounded py-3 px-2 justify-between font-semibold items-center">
              <span className="text-lg md:text-2xl">
                {t("home.bookingForm.total")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl">
                  {symbol}
                  {bookingBreakdown.userPays.toFixed(2)}
                </span>
              </div>
            </div>
          </>

          {!showPaymentStep && (
            <>
              <Button
                type="button"
                variant={"default"}
                className="hidden w-full md:inline-flex"
                onClick={handleReserveClick}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                {t("home.bookingForm.bookNow")}
              </Button>
              {extraActionBelowBookNow}
            </>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setCancellationModalOpen(true)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto transition-colors"
          >
            <FileText className="w-4 h-4" />
            {t("home.bookingForm.cancellationPolicies")}
          </button>
        </div>

        <Dialog open={cancellationModalOpen} onOpenChange={setCancellationModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("home.bookingForm.cancellationModal.title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{t("home.bookingForm.cancellationModal.intro")}</p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>{t("home.bookingForm.cancellationModal.fullRefund")}</li>
                <li>{t("home.bookingForm.cancellationModal.partialRefund")}</li>
                <li>{t("home.bookingForm.cancellationModal.noRefund")}</li>
              </ul>
              <p>{t("home.bookingForm.cancellationModal.changes")}</p>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </div>

      {mounted &&
      typeof document !== "undefined" &&
      !showPaymentStep &&
      createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] md:hidden print:hidden">
          <div className="pointer-events-auto px-3 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))] pt-2">
            <div className="isolate mx-auto flex max-w-lg items-stretch gap-3 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-tr from-black/30 to-gray-800/30 p-3 text-white shadow-lg backdrop-blur-md ring-1 ring-white/10">
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  {t("home.bookingForm.total")}
                </span>
                <span className="text-xl font-bold tabular-nums leading-none tracking-tight text-white">
                  {symbol}
                  {bookingBreakdown.userPays.toFixed(2)}
                </span>
                <span className="truncate text-[11px] text-white/65">
                  {adultTickets} {t("home.bookingForm.adults").toLowerCase()}
                  {" · "}
                  {symbol}
                  {baseForBreakdown} {t("home.bookingForm.perPerson")}
                </span>
              </div>
              <Button
                type="button"
                variant="default"
                onClick={handleReserveClick}
                className="h-auto min-h-[3.25rem] min-w-0 shrink-0 rounded-xl !bg-white !text-gray-900 shadow-md transition-transform hover:!bg-white/90 active:scale-[0.98] sm:px-5 [&_svg]:!text-gray-900"
              >
                <span className="flex min-w-0 items-center gap-2 px-1 sm:px-0">
                  <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-left leading-tight whitespace-nowrap">
                    {t("home.bookingForm.bookNow")}
                  </span>
                </span>
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
