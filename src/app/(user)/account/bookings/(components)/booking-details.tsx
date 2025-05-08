/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, Download, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { IBookingUser } from "@/types/booking";
import moment from "moment";
import "moment/locale/es";

interface BookingDetailsProps {
  booking: IBookingUser;
  open: boolean;
  onClose: () => void;
}

export function BookingDetails({
  booking,
  open,
  onClose,
}: BookingDetailsProps) {
  // Map API status to UI status
  const mapStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "completado",
      confirmed: "confirmado",
      pending: "pendiente",
      cancelled: "cancelado",
    };
    return statusMap[status] || status;
  };

  const uiStatus = mapStatus(booking.status);

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

  // Format the date from ISO string

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[55%] p-0 overflow-hidden rounded-xl border-none shadow-xl">
        <DialogTitle className="sr-only">Detalles de la reserva</DialogTitle>
        <DialogDescription className="sr-only">
          Información detallada de su reserva
        </DialogDescription>
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={onClose}
            className="rounded-full p-1.5 bg-black/50 backdrop-blur-sm text-white hover:bg-black/30 transition-colors"
            aria-label="Cerrar"
          >
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
          </button>
        </div>
        <div className="bg-gradient-to-r dark:from-black border-none">
          <div className="relative h-48 sm:h-64 w-full">
            <img
              src={booking.product_banner || "/logo.png"}
              alt={booking.product_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Badge
                className={`mb-3 font-normal py-1 px-2 ${statusColors[uiStatus as keyof typeof statusColors]}`}
                variant="outline"
              >
                {statusText[uiStatus as keyof typeof statusText]}
              </Badge>
              <h3 className="text-2xl font-medium mb-1">
                {booking.product_name}
              </h3>
              <p className="text-sm opacity-90">
                Reserva #{booking.id.split("-").pop()}
              </p>
            </div>
          </div>

          <div className="px-6 w-full">
            <Tabs defaultValue="details" className="w-full pt-1">
              <TabsList className="my-2 bg-background border-b w-full justify-start rounded-none h-auto p-0 space-x-8">
                <TabsTrigger
                  value="details"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1"
                >
                  Detalles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-2">
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Fechas</p>
                      <p className="text-muted-foreground">
                        {moment(booking.tourDate).format(
                          "dddd, D [de] MMMM - h:mm A"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-muted-foreground">{`${booking.product_address}, ${booking.country}`}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Participantes</p>
                      <p className="text-muted-foreground">
                        {booking.tickets}{" "}
                        {booking.tickets === 1 ? "persona" : "personas"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Duración</p>
                      <p className="text-muted-foreground">1 día</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-1 pt-4 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Información del viaje
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {booking.product_description}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row gap-2 justify-end w-full">
            <div className="flex gap-2">
              {/*  {canCancel && (
                <Button variant="destructive" size="sm">
                  Cancelar reserva
                </Button>
              )} */}
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Descargar voucher
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
