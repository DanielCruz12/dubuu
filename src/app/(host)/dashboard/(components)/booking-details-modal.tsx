/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { formatPhoneNumber } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, CreditCard, Phone, MapPin } from "lucide-react";
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
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="overflow-hidden rounded-lg border bg-muted/30 w-full cursor-pointer hover:opacity-90 transition-opacity"
    >
      <img
        src={src}
        alt={alt}
        className="h-48 w-full object-contain"
        loading="lazy"
      />
    </button>
  );
}

function ImageLightbox({
  src,
  alt,
  open,
  onClose,
}: {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 z-10 text-white opacity-90 bg-black/40 rounded-full p-1.5 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="5" y1="5" x2="15" y2="15" />
          <line x1="15" y1="5" x2="5" y2="15" />
        </svg>
      </button>
      <div
        className="w-full h-full max-h-screen overflow-auto touch-auto flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-[95vw] max-h-[95vh] object-contain"
        />
      </div>
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
  /** Dirección del producto (tours) para el link de Google Maps */
  tourAddress?: string | null;
}

export function BookingDetailsModal({
  booking,
  open,
  onClose,
  tourAddress,
}: BookingDetailsModalProps) {
  const { t, language } = useLanguage();
  const isDesktop = useIsDesktopMd();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const locale = language === "es" ? "es" : "en";
  const dateFormat =
    language === "es" ? "dddd, D [de] MMMM h:mm A" : "dddd, MMMM D h:mm A";
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

  const mapsUrlFor = (address: string | null | undefined) =>
    address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;

  const pickupMapsUrl = mapsUrlFor(booking.pickup_location);
  const dropoffMapsUrl = mapsUrlFor(booking.dropoff_location);
  const tourMapsUrl = mapsUrlFor(tourAddress);

  const documents = [
    { src: booking.dui_front, label: t("dashboard.clientDetails.duiFront") },
    { src: booking.dui_back, label: t("dashboard.clientDetails.duiBack") },
    { src: booking.license_front, label: t("dashboard.clientDetails.licenseFront") },
    { src: booking.license_back, label: t("dashboard.clientDetails.licenseBack") },
  ].filter((d) => d.src);

  const content = (
    <div className="space-y-6 overflow-y-auto max-h-[min(70vh,520px)] pr-1">
      {/* Product info */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {isRental ? t("dashboard.clientDetails.rentalDetails") : t("dashboard.clientDetails.tourDetails")}
        </h3>
        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          {/* Status + Payment + Total */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className={`capitalize text-xs font-normal ${statusColor}`}>
              {displayStatus}
            </Badge>
            {booking.paymentMethod && (
              <Badge variant="secondary" className="capitalize text-xs font-normal">
                <CreditCard className="h-3 w-3 mr-1" />
                {paymentLabel}
              </Badge>
            )}
            <span className="ml-auto text-base font-bold text-primary tabular-nums">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                Number.parseFloat(booking.total)
              )}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("dashboard.products.filters.product")}</p>
            <p className="text-sm font-medium">{booking.name}</p>
          </div>

          {isRental ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.pickup")}</p>
                <p className="text-sm font-medium">
                  {booking.pickup_time
                    ? moment(booking.pickup_time).locale(locale).format(dateFormat)
                    : "—"}
                </p>
                <p className="text-sm font-medium">{booking.pickup_location ?? "—"}</p>
                {pickupMapsUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 mt-1.5 text-xs"
                  >
                    <a href={pickupMapsUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="mr-1.5 h-3.5 w-3.5" />
                      {t("dashboard.clientDetails.viewOnGoogleMaps")}
                    </a>
                  </Button>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.dropoff")}</p>
                <p className="text-sm font-medium">
                  {booking.dropoff_time
                    ? moment(booking.dropoff_time).locale(locale).format(dateFormat)
                    : "—"}
                </p>
                <p className="text-sm font-medium">{booking.dropoff_location ?? "—"}</p>
                {dropoffMapsUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 mt-1.5 text-xs"
                  >
                    <a href={dropoffMapsUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="mr-1.5 h-3.5 w-3.5" />
                      {t("dashboard.clientDetails.viewOnGoogleMaps")}
                    </a>
                  </Button>
                )}
              </div>
            </div>
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
              {tourAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{t("dashboard.clientDetails.location")}</p>
                    <p className="text-sm font-medium">{tourAddress}</p>
                    {tourMapsUrl && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 mt-1.5 text-xs"
                      >
                        <a href={tourMapsUrl} target="_blank" rel="noopener noreferrer">
                          <MapPin className="mr-1.5 h-3.5 w-3.5" />
                          {t("dashboard.clientDetails.viewOnGoogleMaps")}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

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
            <p className="text-sm font-medium">{formatPhoneNumber(booking.user?.phone_number)}</p>
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
                  <DocumentImage src={doc.src!} alt={doc.label} onOpen={() => setLightboxSrc(doc.src!)} />
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
      <>
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
        {lightboxSrc && (
          <ImageLightbox
            src={lightboxSrc}
            alt="Document"
            open={!!lightboxSrc}
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
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
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt="Document"
          open={!!lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  );
}
