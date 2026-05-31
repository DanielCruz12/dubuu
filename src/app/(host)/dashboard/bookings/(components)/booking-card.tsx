"use client";

import { Eye, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { HostBooking } from "@/types/booking";
import type { ChecklistType } from "@/types/contract";
import { ContractCell } from "./contract-cell";
import moment from "moment";
import "moment/locale/es";

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

  const user = booking.user;
  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user?.username ?? "";

  const status = booking.status;
  const statusLabel = t(`dashboard.bookings.status.${status}`);
  const displayStatus = statusLabel.startsWith("dashboard.") ? status : statusLabel;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header: Avatar + Client name + Product name (rentals only) */}
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
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate" title={displayName}>
                {displayName || "—"}
              </h3>
              <p className="text-xs text-muted-foreground truncate" title={booking.name}>
                {booking.name}
              </p>
            </div>
            <Badge
              variant={status === "completed" ? "outline" : status === "cancelled" ? "destructive" : "default"}
              className="capitalize shrink-0 text-xs"
            >
              {displayStatus}
            </Badge>
          </div>
        )}

        {/* Total + Status row (rentals only) */}
        {tableKind === "rental" ? (
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-primary">
              {formatCurrency(booking.total)}
            </div>
            <Badge
              variant={status === "completed" ? "outline" : status === "cancelled" ? "destructive" : "default"}
              className="capitalize shrink-0 text-xs"
            >
              {displayStatus}
            </Badge>
          </div>
        ) : (
          <div className="text-lg font-bold text-primary">
            {formatCurrency(booking.total)}
          </div>
        )}

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

        {/* Action buttons (rentals only) */}
        {tableKind === "rental" && (
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
            <ContractCell booking={booking} onOpenChecklist={onOpenChecklist} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
