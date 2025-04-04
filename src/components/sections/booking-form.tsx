/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import type { IProduct } from "@/types/product";
import { Separator } from "../ui/separator";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useCreatePaymentLinkMutation } from "@/redux/slices/payment/payment-link";
import {
  useCreateBookingMutation,
  useGetBookingsByUserIdQuery,
} from "@/redux/slices/booking/booking-slice";
import { isProductType } from "@/utils";

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

export default function BookingForm({ product }: { product: IProduct }) {
  const { user } = useUser();
  const { data: userBookings } = useGetBookingsByUserIdQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  const existingBooking = userBookings?.find(
    (b) => b.product_id === product.id && b.status === "in-process"
  );

  useEffect(() => {
    if (existingBooking) {
      setIsDialogOpen(true);
    }
  }, [existingBooking]);

  const [createBooking] = useCreateBookingMutation();
  const [createPaymentLink, { isLoading }] = useCreatePaymentLinkMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<{
    idEnlace: number;
    urlQrCodeEnlace: string;
    urlEnlace: string;
    estaProductivo: boolean;
    createdAt?: string;
  } | null>(null);

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

  const calculateTotal = () => {
    const ticketTotal = watchData.tickets.adult * product.price;
    const iva = ticketTotal * 0.13;
    const turismo = ticketTotal * 0.05;
    const serviceFee = ticketTotal * 0.03;
    return (ticketTotal + iva + turismo + serviceFee).toFixed(2);
  };

  const onSubmit = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para continuar con la reserva");
      return;
    }

    const total = parseFloat(calculateTotal());

    const payload = {
      identificadorEnlaceComercio: "dantours",
      monto: total,
      nombreProducto: product.name,
      formaPago: {
        permitirTarjetaCreditoDebido: true,
        permitirPagoConPuntoAgricola: false,
        permitirPagoEnCuotasAgricola: false,
      },
      cantidadMaximaCuotas: "",
      infoProducto: {
        descripcionProducto: product.description,
        urlImagenProducto: product.banner,
      },
      configuracion: {
        urlRedirect: "https://dantour.vercel.app",
        esMontoEditable: false,
        esCantidadEditable: true,
        cantidadPorDefecto: 1,
        duracionInterfazIntentoMinutos: 60,
        urlRetorno: "https://dantour.vercel.app",
        emailsNotificacion:
          user.emailAddresses?.[0]?.emailAddress ?? "dubondanielcruz@gmail.com",
        urlWebhook: null,
        telefonosNotificacion:
          user.phoneNumbers?.[0]?.phoneNumber ?? "77886116",
        notificarTransaccionCliente: true,
      },
    };

    try {
      const result = await createPaymentLink(payload).unwrap();

      await createBooking({
        user_id: user.id,
        status: "in-process",
        product_id: product.id,
        payment_link_id: result.idEnlace,
        payment_url: result.urlEnlace,
        qr_url: result.urlQrCodeEnlace,
        is_live: result.estaProductivo,
      });

      const timestamp = new Date();

      setPaymentResponse({
        ...result,
        createdAt: timestamp.toISOString(),
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error al enviar la solicitud de pago:", error);
      toast.error("Error al generar el enlace de pago");
    }
  };

  const paymentResult = existingBooking
    ? {
        idEnlace: existingBooking.payment_link_id,
        urlQrCodeEnlace: existingBooking.qr_url,
        urlEnlace: existingBooking.payment_url,
        estaProductivo: existingBooking.is_live,
      }
    : paymentResponse;

  const handleReserveClick = () => {
    if (paymentResult) {
      setIsDialogOpen(true);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="sticky top-4 bg-background dark:bg-background rounded-lg dark:border-muted px-2 max-w-md mx-auto">
      <h2 className="text-base font-semibold mb-4">
        Reservar - {product.name}
      </h2>

      <form className="space-y-6">
        <div>
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
              <span>IVA (13%):</span>
              <span>
                ${(watchData.tickets.adult * product.price * 0.13).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuesto de Turismo (5%):</span>
              <span>
                ${(watchData.tickets.adult * product.price * 0.05).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tarifa de Servicio (3%):</span>
              <span>
                ${(watchData.tickets.adult * product.price * 0.03).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>
                ${(watchData.tickets.adult * product.price).toFixed(2)}
              </span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-semibold items-center">
              <span>
                Total:
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        className="rounded-xl mx-2 p-2"
                        variant="outline"
                      >
                        ?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="mt-1">
                        <em>
                          Nuestra tarifa de servicio es mucho menor comparada
                          con Airbnb (14-16%) y Booking (15-18%).
                        </em>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <div className="flex items-center gap-2">
                <span>${calculateTotal()}</span>
              </div>
            </div>
          </div>

          <Button
            disabled={isLoading}
            type="button"
            className="w-full"
            onClick={handleReserveClick}
          >
            {isLoading
              ? "Cargando..."
              : paymentResult
                ? "Ver link de pago"
                : "Reservar ahora"}
          </Button>
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

      {paymentResult && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && setIsDialogOpen(false)}
        >
          <DialogContent className="sm:max-w-[425px] p-6">
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl">Pago con QR</DialogTitle>
              <DialogDescription>
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

            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
