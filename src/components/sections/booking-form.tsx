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
import { Users } from "lucide-react";
import type { IProduct } from "@/types/product";
import { Separator } from "../ui/separator";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { isProductType } from "@/utils";
import { useState, useRef } from "react";
import { getHostEarningsFromFinalPrice } from "@/lib/price";

import "moment/locale/es";
import { useCurrency } from "@/hooks/use-currency-converter";
import { useLanguage } from "@/lib/i18n-context";

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
  setShowPaymentStep,
  setBookingData,
  showPaymentStep,
}: {
  product: IProduct;
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
}) {
  const { t } = useLanguage();
  const { user } = useUser();
  const { convert, symbol } = useCurrency();

  const datetimeRef = useRef<HTMLDivElement>(null);

  const [selectedDateAvailability, setSelectedDateAvailability] = useState<{
    maxPeople: number;
    peopleBooked: number;
    availableSpots: number;
  } | null>(null);

  const isTour = isProductType(product, "tours");

  const availableDates = isTour
    ? (product.tour?.tour_dates ?? [])
        .filter((dateObj) => moment(dateObj.date).isAfter(moment()))
        .map((dateObj) => ({
          value: dateObj.id,
          label: moment(dateObj.date).format("dddd, D [de] MMMM - h:mm A"),
          maxPeople: dateObj.max_people,
          peopleBooked: dateObj.people_booked,
          availableSpots: dateObj.max_people - dateObj.people_booked,
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

  const onSubmit = async () => {
    if (!user) {
      toast.error(t("home.bookingForm.toast.loginRequired"));
      return;
    }

    setBookingData({
      datetime: watchData.datetime,
      tickets: watchData.tickets,
      addons: watchData.addons,
      total: product.price * watchData.tickets.adult,
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
              {convert(product.price)}{" "}
              <span className="text-sm text-muted-foreground">{t("home.bookingForm.perPerson")}</span>
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
          {(() => {
            const price = convert(product.price);
            const adultTickets = watchData.tickets.adult;
            const breakdown = getHostEarningsFromFinalPrice(
              price,
              adultTickets
            );

            return (
              <>
                <div className="flex justify-between text-sm">
                  <span>{t("home.bookingForm.pricePerPerson")}</span>
                  <span>
                    {symbol}
                    {price} {t("home.bookingForm.perPerson")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>
                    {symbol}
                    {breakdown.userPays.toFixed(2)}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex rounded py-3 px-2 justify-between font-semibold items-center">
                  <span className="text-lg md:text-2xl">{t("home.bookingForm.total")}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg md:text-2xl">
                      {symbol}
                      {breakdown.userPays.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}

          {!showPaymentStep && (
            <Button
              type="button"
              variant={"default"}
              className="w-full"
              onClick={handleReserveClick}
            >
              {t("home.bookingForm.bookNow")}
            </Button>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
          >
            <Users className="w-4 h-4" />
            {t("home.bookingForm.needHelp")}
          </button>
        </div>
      </form>
    </div>
  );
}
