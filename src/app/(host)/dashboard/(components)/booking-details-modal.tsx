/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ticket, CreditCard, Phone } from "lucide-react";
import type { HostBooking } from "@/types/booking";
import { statusColors, statusTextTranslations } from "@/utils/data";
import moment from "moment";
import "moment/locale/es";

function useIsDesktopMd(): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setWide(mq.matches);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide;
}

function DocumentImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/30">
      <img
        src={src}
        alt={alt}
        className="h-48 w-full object-contain"
        loading="lazy"
      />
    </div>
  );
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

function getPaymentMethodLabel(method: string | null | undefined, t: (key: string) => string): string {
  switch (method) {
    case "blink":
      return "Bitcoin Lightning (Blink)";
    case "credit":
      return t("home.checkout.payment.creditCard");
    default:
      return method || "—";
  }
}

interface BookingDetailsModalProps {
  booking: HostBooking | null;
  open: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({
  booking,
  open,
  onClose,
}: BookingDetailsModalProps) {
  const { t, language } = useLanguage();
  const isDesktop = useIsDesktopMd();
  const locale = language === "es" ? "es" : "en";
  const dateFormat =
    language === "es" ? "DD/MM/YYYY h:mm A" : "MM/DD/YYYY h:mm A";
  const statusText = statusTextTranslations[language];

  if (!booking) return null;

  const isRental = booking.booking_kind === "rental";
  const fullName =
    booking.user?.first_name && booking.user?.last_name
      ? `${booking.user.first_name} ${booking.user.last_name}`.trim()
      : booking.user?.username ?? "—";

  const uiStatus = mapStatus(booking.status);
  const statusColor = statusColors[uiStatus as keyof typeof statusColors];
  const displayStatus =
    statusText[uiStatus as keyof typeof statusText] || booking.status;

  const paymentLabel = getPaymentMethodLabel(booking.paymentMethod, t);

  const documents = [
    { src: booking.dui_front, label: t("dashboard.clientDetails.duiFront") },
    { src: booking.dui_back, label: t("dashboard.clientDetails.duiBack") },
    { src: booking.license_front, label: t("dashboard.clientDetails.licenseFront") },
    { src: booking.license_back, label: t("dashboard.clientDetails.licenseBack") },
  ].filter((d) => d.src);

  const content = (
    <div className="space-y-6 overflow-y-auto max-h-[min(70vh,520px)] pr-1">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`capitalize text-xs font-normal ${statusColor}`}>
          {displayStatus}
        </Badge>
        {booking.paymentMethod && (
          <Badge variant="secondary" className="capitalize text-xs font-normal">
            <CreditCard className="h-3 w-3 mr-1" />
            {paymentLabel}
          </Badge>
        )}
      </div>

      {/* Product info */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t("dashboard.clientDetails.rentalDetails")}
        </h3>
        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("dashboard.products.filters.product")}</p>
            <p className="text-sm font-medium">{booking.name}</p>
          </div>

          {isRental ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.pickupDate")}</p>
                  <p className="text-sm font-medium">
                    {booking.pickup_time
                      ? moment(booking.pickup_time).locale(locale).format(dateFormat)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.dropoffDate")}</p>
                  <p className="text-sm font-medium">
                    {booking.dropoff_time
                      ? moment(booking.dropoff_time).locale(locale).format(dateFormat)
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.pickupLocation")}</p>
                  <p className="text-sm font-medium">{booking.pickup_location ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.dropoffLocation")}</p>
                  <p className="text-sm font-medium">{booking.dropoff_location ?? "—"}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.bookings.table.bookingDate")}</p>
                  <p className="text-sm font-medium">
                    {booking.tourDate
                      ? moment(booking.tourDate).locale(locale).format(dateFormat)
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Ticket className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.bookings.table.tickets")}</p>
                  <p className="text-sm font-medium">{booking.tickets ?? "—"}</p>
                </div>
              </div>
            </>
          )}

          <div className="flex items-start gap-2">
            <CreditCard className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{t("home.bookingStatus.paymentMethod")}</p>
              <p className="text-sm font-medium">{paymentLabel}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">{t("home.bookingStatus.total")}</p>
            <p className="text-lg font-bold text-primary">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                Number.parseFloat(booking.total)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Client info */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t("dashboard.clientDetails.clientInfo")}
        </h3>
        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-4">
          <div>
            <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.name")}</p>
            <p className="text-sm font-medium">{fullName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.email")}</p>
            <p className="text-sm font-medium break-all">{booking.user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              <Phone className="h-3 w-3 inline mr-1" />
              {t("dashboard.clientDetails.phone")}
            </p>
            <p className="text-sm font-medium">{booking.user?.phone_number ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Notes (rental) */}
      {isRental && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("dashboard.bookings.table.notes")}
          </h3>
          <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.pickupNotes")}</p>
              <p className="text-sm font-medium">{booking.pickup_notes || t("dashboard.clientDetails.noNotes")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.dropoffNotes")}</p>
              <p className="text-sm font-medium">{booking.dropoff_notes || t("dashboard.clientDetails.noNotes")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents (rental only) */}
      {isRental && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("dashboard.clientDetails.documents")}
          </h3>
          {documents.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div key={doc.label}>
                  <p className="text-xs text-muted-foreground mb-1">{doc.label}</p>
                  <DocumentImage src={doc.src!} alt={doc.label} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t("dashboard.clientDetails.noDocuments")}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl gap-0 overflow-hidden p-0 pt-6">
          <DialogHeader className="px-6 pb-2 text-left">
            <DialogTitle>{t("dashboard.clientDetails.title")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("dashboard.clientDetails.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-[1.25rem] max-h-[min(88dvh,600px)] w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6"
      >
        <SheetHeader className="pb-4 text-left space-y-1">
          <SheetTitle className="text-lg">{t("dashboard.clientDetails.title")}</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
