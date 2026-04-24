/* eslint-disable @next/next/no-img-element */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import type { IBookingUser } from "@/types/booking";
import moment from "moment";
import "moment/locale/es";
import Image from "next/image";
import { statusColors, statusTextTranslations } from "@/utils/data";
import { useLanguage } from "@/lib/i18n-context";

interface BookingCardProps {
  booking: IBookingUser;
  onClick: () => void;
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const { language } = useLanguage();
  const statusText = statusTextTranslations[language];
  const dateLabelFormat =
    language === "es" ? "dddd, D [de] MMMM - h:mm A" : "dddd, MMMM D - h:mm A";

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

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-all cursor-pointer border border-border/40 group"
      onClick={onClick}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="relative h-full w-full">
          <Image
            src={booking.product_banner || "/logo.svg"}
            alt={booking.product_name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <Badge
          className={`absolute bottom-3 left-3 font-normal py-1.5 px-2.5 backdrop-blur-sm shadow-md ${statusColors[uiStatus as keyof typeof statusColors]}`}
          variant="outline"
        >
          {statusText[uiStatus as keyof typeof statusText]}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="text-base md:text-lg font-bold pt-2 text-wrap line-clamp-1">
          {booking.product_name}
        </h3>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">
              {" "}
              {moment(booking.tourDate)
                .locale(language === "es" ? "es" : "en")
                .format(dateLabelFormat)}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">{`${booking.product_address}, ${booking.country}`}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/60">
          <div className="text-start">
            <p className="font-semibold">${booking.total}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Ref: {booking.id.split("-").pop()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
