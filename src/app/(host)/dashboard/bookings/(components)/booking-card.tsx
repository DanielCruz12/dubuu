/* eslint-disable @next/next/no-img-element */
"use client";

import { Eye, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { HostBooking } from "@/types/booking";
import type { ChecklistType } from "@/types/contract";
import { ContractCell } from "./contract-cell";
import { statusColors, statusTextTranslations } from "@/utils/data";
import moment from "moment";
import "moment/locale/es";
import Image from "next/image";

interface BookingCardProps {
  booking: HostBooking;
  tableKind: "tours" | "rental";
  t: (key: string) => string;
  language: string;
  onOpenChecklist: (bookingId: string, contractId: string, type: ChecklistType) => void;
  onOpenDetails: (booking: HostBooking) => void;
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    completed: "completado",
    confirmed: "confirmado",
    pending: "pendiente",
    cancelled: "cancelado",
    "in-process": "pendiente",
  };
  return statusMap[status] || status;
}

export function BookingCard({
  booking,
  tableKind,
  t,
  language,
  onOpenChecklist,
  onOpenDetails,
}: BookingCardProps) {
  const locale = language === "en" ? "en" : "es";
  const dateFormat = language === "es" ? "DD/MM/YYYY h:mm A" : "MM/DD/YYYY h:mm A";
  const statusText = statusTextTranslations[language as keyof typeof statusTextTranslations];

  const user = booking.user;
  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user?.username ?? "";

  const status = booking.status;
  const uiStatus = mapStatus(status);
  const statusColor = statusColors[uiStatus as keyof typeof statusColors];
  const displayStatus =
    statusText[uiStatus as keyof typeof statusText] || status;

  const hasNotes =
    booking.pickup_notes || booking.dropoff_notes;

  return (
    <Card className="overflow-hidden">
      {/* Product image banner */}
      {booking.product_banner && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={booking.product_banner}
            alt={booking.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Header: Avatar + Client name + Product name */}
        {tableKind === "rental" ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user?.image_url ?? undefined} alt={displayName} />
              <AvatarFallback>
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate" title={displayName}>
                {displayName || "—"}
              </h3>
              <p className="text-xs text-muted-foreground truncate" title={booking.name}>
                {booking.name}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`capitalize shrink-0 text-xs font-normal ${statusColor}`}
            >
              {displayStatus}
            </Badge>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={user?.image_url ?? undefined} alt={displayName} />
                <AvatarFallback>
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate" title={displayName}>
                  {displayName || "—"}
                </h3>
                <p className="text-xs text-muted-foreground truncate" title={booking.name}>
                  {booking.name}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`capitalize shrink-0 text-xs font-normal ${statusColor}`}
            >
              {displayStatus}
            </Badge>
          </div>
        )}

        {/* Total */}
        <div className="text-lg font-bold text-primary">
          {formatCurrency(booking.total)}
        </div>

        {/* Date info */}
        {tableKind === "tours" ? (
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold">{t("dashboard.bookings.table.bookingDate")}:</span>{" "}
            {booking.tourDate
              ? moment(booking.tourDate).locale(locale).format("dddd, D [de] MMMM - h:mm A")
              : "—"}
          </div>
        ) : (
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>
              <span className="font-semibold">{t("dashboard.bookings.table.pickupDate")}:</span>{" "}
              {booking.pickup_time
                ? moment(booking.pickup_time).locale(locale).format(dateFormat)
                : "—"}
            </div>
            <div>
              <span className="font-semibold">{t("dashboard.bookings.table.dropoffDate")}:</span>{" "}
              {booking.dropoff_time
                ? moment(booking.dropoff_time).locale(locale).format(dateFormat)
                : "—"}
            </div>
            {booking.pickup_location && (
              <div className="truncate" title={booking.pickup_location}>
                <span className="font-semibold">{t("dashboard.bookings.table.pickupLocation")}:</span>{" "}
                {booking.pickup_location}
              </div>
            )}
          </div>
        )}

        {/* Tickets (tours only) */}
        {tableKind === "tours" && (
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold">{t("dashboard.bookings.table.tickets")}:</span>{" "}
            {booking.tickets ?? "—"}
          </div>
        )}

        {/* Notes accordion */}
        {hasNotes && (
          <Accordion type="single" collapsible className="border-t pt-1">
            <AccordionItem value="notes" className="border-none">
              <AccordionTrigger className="text-xs font-medium py-1 hover:no-underline">
                {t("dashboard.bookings.table.notes")}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-1 pb-1">
                {booking.pickup_notes && (
                  <p>
                    <span className="font-medium">{t("dashboard.bookings.table.pickupNotes")}:</span>{" "}
                    {booking.pickup_notes}
                  </p>
                )}
                {booking.dropoff_notes && (
                  <p>
                    <span className="font-medium">{t("dashboard.bookings.table.dropoffNotes")}:</span>{" "}
                    {booking.dropoff_notes}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-1.5 pt-1">
          <Button
            variant="default"
            size="sm"
            className="h-8 w-full justify-center text-xs"
            onClick={() => onOpenDetails(booking)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            {t("dashboard.bookings.table.details")}
          </Button>
          {tableKind === "rental" && (
            <ContractCell booking={booking} onOpenChecklist={onOpenChecklist} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
