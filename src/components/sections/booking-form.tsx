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
import { calculateTotal, isProductType } from "@/utils";
import { useRef } from "react";

moment.locale("es");

const schema = z.object({
  datetime: z.string().min(1, "Selecciona una fecha y hora"),
  tickets: z.object({
    adult: z.coerce
      .number()
      .min(1, "Mínimo 1 entrada")
      .max(15, "Máximo 15 entradas"),
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

  const isTour = isProductType(product, "tour");

  const availableDates = isTour
    ? product.tour.available_dates.map((date) => ({
        value: date,
        label: moment(date).format("dddd, D [de] MMMM - h:mm A"),
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
      total: calculateTotal({ watchData, product }),
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
    } else {
      handleSubmit(onSubmit, handleError)();
    }
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
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-1 w-full mx-auto">
                  <SelectValue placeholder="Selecciona una fecha y hora" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((d) => (
                    <SelectItem
                      key={d.value.toString()}
                      value={d.value.toString()}
                      disabled={showPaymentStep}
                    >
                      {d.label}
                    </SelectItem>
                  ))}
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
                      disabled={showPaymentStep}
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
                      disabled={showPaymentStep}
                      onClick={() =>
                        field.onChange(Math.min(field.value + 1, 15))
                      }
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
                ${(watchData.tickets.adult * product.price * 0.13).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuesto de Turismo (5%)</span>
              <span>
                ${(watchData.tickets.adult * product.price * 0.05).toFixed(2)}
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
                ${(watchData.tickets.adult * product.price * 0.03).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                ${(watchData.tickets.adult * product.price).toFixed(2)}
              </span>
            </div>
            <Separator className="my-3" />

            <div className="flex rounded py-3 px-2 justify-between font-semibold items-center">
              <span className="text-lg md:text-2xl">Total</span>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl">
                  ${calculateTotal({ watchData, product })}
                </span>
              </div>
            </div>
          </div>

          {!showPaymentStep && (
            <Button
              type="button"
              variant={"secondary"}
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
      {/* 
      {paymentResult && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && setIsDialogOpen(false)}
        >
          <DialogContent className="sm:max-w-[425px] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%] p-0 overflow-hidden rounded-xl border-none shadow-xl">
            <div className="bg-gradient-to-r dark:from-black dark:to-primary/5 border-none px-4 md:px-0">
              <DialogHeader className="text-center">
                <DialogTitle className="text-center pt-6">
                  Pago con QR
                </DialogTitle>
                <DialogDescription className="text-center pb-2">
                  Escanea el código QR o usa el enlace para completar tu pago
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center justify-center">
                <div className="bg-white rounded-lg shadow-sm mb-4">
                  <img
                    src={paymentResult.urlQrCodeEnlace}
                    alt="QR Code"
                    className="w-48 h-48 md:w-64 md:h-64 object-contain"
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Total a pagar:{" "}
                    <span className="font-semibold">${calculateTotal()}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ¿Cambiaste de idea? Puedes contactarnos para modificar o
                    cancelar tu reserva.
                  </p>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 py-2 pb-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>

                 <Button asChild className="w-full sm:w-auto order-1 sm:order-2">
                  <a
                    href={paymentResult.urlEnlace}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ir a pago
                  </a>
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
      */}
    </div>
  );
}
