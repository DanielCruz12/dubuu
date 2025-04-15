/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CreditCard,
  Download,
  MessageSquare,
  Info,
} from "lucide-react";

interface BookingDetailsProps {
  booking: any;
  open: boolean;
  onClose: () => void;
}

export function BookingDetails({
  booking,
  open,
  onClose,
}: BookingDetailsProps) {
  const statusColors = {
    confirmado: "bg-green-50 text-green-700 border-green-200",
    pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    completado: "bg-blue-50 text-blue-700 border-blue-200",
    cancelado: "bg-red-50 text-red-700 border-red-200",
  };

  const statusText = {
    confirmado: "Confirmado",
    pendiente: "Pendiente",
    completado: "Completado",
    cancelado: "Cancelado",
  };

  const canCancel =
    booking.status === "confirmado" || booking.status === "pendiente";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-2xl p-0 overflow-hidden">
        <div className="relative h-48 sm:h-64 w-full">
          <img
            src={booking.tourImage || "/placeholder.svg"}
            alt={booking.tourName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <Badge
              className={`mb-3 font-normal py-1 px-2 ${statusColors[booking.status as keyof typeof statusColors]}`}
              variant="outline"
            >
              {statusText[booking.status as keyof typeof statusText]}
            </Badge>
            <h3 className="text-2xl font-medium mb-1">{booking.tourName}</h3>
            <p className="text-sm opacity-90">
              Reserva #{booking.bookingNumber}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white bg-black/20 hover:bg-black/40 rounded-full"
            onClick={onClose}
          >
            <span className="sr-only">Cerrar</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>
        </div>

        <div className="px-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-2 bg-background border-b w-full justify-start rounded-none h-auto p-0 space-x-8">
              <TabsTrigger
                value="details"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1"
              >
                Detalles
              </TabsTrigger>
              <TabsTrigger
                value="itinerary"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
              >
                Itinerario
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
              >
                Pago
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Fechas</p>
                    <p className="text-muted-foreground">
                      del 1 al 3 de marzo, 2025
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-muted-foreground">{booking.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Participantes</p>
                    <p className="text-muted-foreground">
                      {booking.participants}{" "}
                      {booking.participants === 1 ? "persona" : "personas"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Duración</p>
                    <p className="text-muted-foreground">{booking.duration}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-primary" />
                  Información del tour
                </h4>
                <p className="text-sm text-muted-foreground">
                  {booking.description}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-6 mt-0">
              <div className="space-y-4">
                {booking.itinerary?.map((day: any, index: number) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary/20 pl-4 pb-4 relative"
                  >
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-0"></div>
                    <h4 className="font-medium">Día {index + 1}</h4>
                    <p className="text-sm text-muted-foreground">{day}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6 mt-0">
              <div className="flex items-start mb-4">
                <CreditCard className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Método de pago</p>
                  <p className="text-muted-foreground">
                    {booking.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio base</span>
                  <span>$20.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span>$2.99</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="text-green-600">-2%</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>28.99</span>
                </div>
                {booking.paidAmount < booking.totalPrice && (
                  <div className="flex justify-between mt-3 pt-3 border-t border-border/60">
                    <span className="text-muted-foreground">
                      Pendiente de pago
                    </span>
                    <span className="font-medium">23</span>
                  </div>
                )}
              </div>

              {booking.paymentSchedule && (
                <div className="mt-4">
                  <h4 className="font-medium mb-3">Calendario de pagos</h4>
                  <div className="space-y-2 text-sm">
                    {booking.paymentSchedule.map(
                      (payment: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between py-2 border-b border-border/40 last:border-0"
                        >
                          <div>
                            <p>{payment.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.date}
                            </p>
                          </div>
                          <div className={payment.paid ? "text-green-600" : ""}>
                            {payment.paid && " ✓"}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Descargar voucher
          </Button>
          <div className="flex gap-2">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200"
              >
                Cancelar reserva
              </Button>
            )}
            <Button size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Contactar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
