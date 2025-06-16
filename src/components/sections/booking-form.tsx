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
import { Info, Users } from "lucide-react";
import type { IProduct } from "@/types/product";
import { Separator } from "../ui/separator";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { isProductType } from "@/utils";
import { useState, useRef } from "react";
import { calculatePriceWithTaxes, getTaxBreakdown } from "@/lib/price";

import "moment/locale/es";
const schema = z.object({
  datetime: z.string().min(1, "Selecciona una fecha y hora"),
  tickets: z.object({
    adult: z.coerce.number().min(1, "Mínimo 1 entrada"),
  }),
  addons: z.array(z.enum(["lunch", "transport"])),
});

type FormData = z.infer<typeof schema>;

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
  const { user } = useUser();

  const datetimeRef = useRef<HTMLDivElement>(null);

  const [selectedDateAvailability, setSelectedDateAvailability] = useState<{
    maxPeople: number;
    peopleBooked: number;
    availableSpots: number;
  } | null>(null);

  const isTour = isProductType(product, "tours");

  const availableDates = isTour
    ? product.tour.tour_dates
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
    resolver: zodResolver(schema),
    defaultValues: {
      datetime: "",
      tickets: { adult: 1 },
      addons: [],
    },
  });

  const watchData = watch();

  const onSubmit = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para continuar con la reserva");
      return;
    }

    setBookingData({
      datetime: watchData.datetime,
      tickets: watchData.tickets,
      addons: watchData.addons,
      total: calculatePriceWithTaxes(product.price, {
        quantity: watchData.tickets.adult,
        formatResult: false,
      }) as number,
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
        `Solo hay ${selectedDateAvailability.availableSpots} lugares disponibles`
      );
      return;
    }

    handleSubmit(onSubmit, handleError)();
  };

  return (
    <div className="sticky top-4 rounded-lg px-2 max-w-md mx-auto">
      <h2 className="text-base font-semibold mb-4 hidden md:block">
        Reservar - {product.name}
      </h2>

      <form className="space-y-6">
        <div ref={datetimeRef}>
          <Label>Fecha y hora:</Label>
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
                  <SelectValue placeholder="Selecciona una fecha y hora" />
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
                              ? `(${d.availableSpots} disp.)`
                              : "(Agotado)"}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-dates" disabled>
                      No hay fechas disponibles
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
          <Label>Entradas:</Label>
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mt-2">
            <span>Adultos (18+)</span>
            <div className="flex items-center gap-2">
              <span>${product.price}</span>
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
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>IVA (13%)</span>
              <span>
                $
                {getTaxBreakdown(
                  product.price,
                  watchData.tickets.adult
                ).iva.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuesto de Turismo (5%)</span>
              <span>
                $
                {getTaxBreakdown(
                  product.price,
                  watchData.tickets.adult
                ).tourismTax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <div className="">
                Tarifa de Servicio (3%)
                <Popover>
                  <PopoverTrigger className="px-1 ml-2 ">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Información sobre impuestos</span>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs">
                    <p className="text-sm text-muted-foreground">
                      Nuestra tarifa de servicio es mucho menor comparada con
                      Airbnb (14-16%) y Booking (15-18%).
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <span>
                $
                {getTaxBreakdown(
                  product.price,
                  watchData.tickets.adult
                ).serviceFee.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                $
                {getTaxBreakdown(
                  product.price,
                  watchData.tickets.adult
                ).subtotal.toFixed(2)}
              </span>
            </div>
            <Separator className="my-3" />

            <div className="flex rounded py-3 px-2 justify-between font-semibold items-center">
              <span className="text-lg md:text-2xl">Total</span>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl">
                  $
                  {calculatePriceWithTaxes(product.price, {
                    quantity: watchData.tickets.adult,
                  })}
                </span>
              </div>
            </div>
          </div>

          {!showPaymentStep && (
            <Button
              type="button"
              variant={"default"}
              className="w-full"
              onClick={handleReserveClick}
            >
              Reservar ahora
            </Button>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
          >
            <Users className="w-4 h-4" />
            ¿Necesitas ayuda?
          </button>
        </div>
      </form>
    </div>
  );
}
