/* eslint-disable @next/next/no-img-element */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import type { IBookingUser } from "@/types/booking";
import moment from "moment";
import "moment/locale/es";

interface BookingCardProps {
  booking: IBookingUser;
  onClick: () => void;
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
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

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-all cursor-pointer border border-border/40 group"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={booking.product_banner || "/placeholder.svg"}
          alt={booking.product_name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <Badge
          className={`absolute bottom-3 left-3 font-normal py-1 px-2 ${statusColors[uiStatus as keyof typeof statusColors]}`}
          variant="outline"
        >
          {statusText[uiStatus as keyof typeof statusText]}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-base mb-2 line-clamp-1">
          {booking.product_name}
        </h3>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">
              {" "}
              {moment(booking.tourDate).format("dddd, D [de] MMMM - h:mm A")}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">{`${booking.product_address}, ${booking.country}`}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/60">
          <div className="text-xs text-muted-foreground">
            Ref: {booking.id.split("-").pop()}
          </div>
          <div className="text-right">
            <p className="font-medium">${booking.total}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
