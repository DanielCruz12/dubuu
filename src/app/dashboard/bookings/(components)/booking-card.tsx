/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Star } from "lucide-react";

interface BookingCardProps {
  booking: any;
  onClick: () => void;
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
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
          src={booking.tourImage || "/placeholder.svg"}
          alt={booking.tourName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <Badge
          className={`absolute bottom-3 left-3 font-normal py-1 px-2 ${statusColors[booking.status as keyof typeof statusColors]}`}
          variant="outline"
        >
          {statusText[booking.status as keyof typeof statusText]}
        </Badge>

        {booking.rating && (
          <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400 mr-1" />
            <span className="text-xs text-white font-medium">
              {booking.rating}
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-base mb-2 line-clamp-1">
          {booking.tourName}
        </h3>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">12 de marzo, 2025</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">{booking.location}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/60">
          <div className="text-xs text-muted-foreground">
            Ref: {booking.bookingNumber.split("-").pop()}
          </div>
          <div className="text-right">
            <p className="font-medium">$20</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
