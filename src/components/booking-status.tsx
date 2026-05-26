/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import moment from "moment";
import { ReceiptProps } from "@/types/pdf";
import PDFButton from "./pdf/pdf-button";
import { statusConfig } from "@/utils";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";

type BookingStatusProps = {
  id: string;
  status: "completed" | "in-process" | "canceled";
  productName?: string;
  productId: string;
  paymentMethod: string;
  user: any;
  created_at: string;
  tourDate?: string;
  tickets: { adult: number; children?: number };
  total: number;
  bookingKind?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  dropoffTime?: string;
  onRebook?: () => void;
  onViewDetails?: () => void;
  extraFooterAction?: ReactNode;
  className?: string;
};

export function BookingStatus({
  id,
  status,
  paymentMethod,
  productId,
  productName,
  created_at,
  tourDate,
  tickets,
  user,
  total,
  bookingKind,
  pickupLocation,
  dropoffLocation,
  pickupTime,
  dropoffTime,
  onRebook,
  onViewDetails,
  extraFooterAction,
  className,
}: BookingStatusProps) {
  const { t, language } = useLanguage();
  const isRental = bookingKind === "rental";
  const customerName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.fullName ?? "";
  const childrenCount = tickets.children ?? 0;
  const ticketsCount = (tickets.adult > 0 ? tickets.adult : 0) + childrenCount || 1;
  const totalNumber = typeof total === "number" ? total : Number(total);
  const paidTotal =
    Number.isFinite(totalNumber) && totalNumber >= 0 ? totalNumber : 0;
  const unitPrice =
    ticketsCount > 0 ? paidTotal / ticketsCount : paidTotal;

  const paymentMethodLabel =
    paymentMethod === "blink"
      ? "Bitcoin Lightning (Blink)"
      : paymentMethod === "credit"
        ? t("home.checkout.payment.creditCard")
        : paymentMethod || t("home.bookingStatus.paymentMethod");

  const receiptItems = isRental
    ? [
        {
          id: productId.slice(0, 8),
          description:
            `${productName ?? ""} — ${t("home.bookingStatus.pickupLocation")}: ${pickupLocation ?? ""}, ${t("home.bookingStatus.dropoffLocation")}: ${dropoffLocation ?? ""}`,
          quantity: 1,
          price: paidTotal,
        },
      ]
    : [
        {
          id: tickets.adult.toString(),
          description: productName as string,
          quantity: ticketsCount,
          price: unitPrice,
        },
      ];

  const receiptData: ReceiptProps = {
    receiptNumber: id.slice(0, 13),
    date: new Date().toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    reservationDate: isRental
      ? `${moment(pickupTime).locale(language).format("LLL")} — ${moment(dropoffTime).locale(language).format("LLL")}`
      : tourDate
        ? moment(tourDate)
            .locale(language)
            .format(language === "es" ? "dddd, D [de] MMMM - h:mm A" : "dddd, MMM D - h:mm A")
        : undefined,
    customerName,
    items: receiptItems,
    subtotal: paidTotal,
    total: paidTotal,
    notes: t("home.bookingStatus.receiptNotes"),
    companyName: "Dubuu",
    companyLogo: "/logo.svg",
    companyAddress: "El Salvador, La Libertad",
    companyPhone: "+503 64562432",
    companyEmail: "support@dubuu.com",
    companyWebsite: "https://www.dubuu.com",
    qrValue: `https://www.dubuu.com/booking/${id.slice(0, 13)}`,
    paymentMethod: paymentMethodLabel,
    paymentStatus: "Completado",
  };

  const baseConfig = statusConfig[status];
  const config = {
    ...baseConfig,
    title: status === "completed" ? t("home.bookingStatus.completed.title") : status === "in-process" ? t("home.bookingStatus.inProcess.title") : t("home.bookingStatus.canceled.title"),
    description: status === "completed" ? t("home.bookingStatus.completed.description") : status === "in-process" ? t("home.bookingStatus.inProcess.description") : t("home.bookingStatus.canceled.description"),
    badgeText: status === "completed" ? t("home.bookingStatus.completed.badgeText") : status === "in-process" ? t("home.bookingStatus.inProcess.badgeText") : t("home.bookingStatus.canceled.badgeText"),
  };
  const Icon = config.icon;

  const convert = formatUsd;
  const symbol = USD_SYMBOL;

  return (
    <Card
      id={`booking-status-${id}`}
      className={cn("overflow-hidden border-0 shadow-none", className)}
    >
      <div className={cn("h-2 border-b")} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Badge className="bg-green-100 dark:bg-green-200 text-green-900 flex items-center gap-1 font-normal">
                  {config.title}
                </Badge>
              </div>
            </CardTitle>
          </div>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex flex-col p-2 rounded">
            <h3 className="text-base font-semibold mb-4">{t("home.bookingStatus.info")}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("home.bookingStatus.bookingNumber")}</span>
                <span className="font-normal">#{id.slice(0, 13)}</span>
              </div>
              {!isRental && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("home.bookingStatus.bookingDate")}</span>
                  <span className="font-normal">
                    {tourDate
                      ? moment(tourDate).locale(language).format("LLL")
                      : moment(created_at).locale(language).format("LLL")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">{t("home.bookingStatus.paymentMethod")}</span>
                <span className="font-normal">{paymentMethodLabel}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            {isRental ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>{t("home.bookingStatus.pickupLocation")}</span>
                  <span className="font-medium">{pickupLocation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("home.bookingStatus.dropoffLocation")}</span>
                  <span className="font-medium">{dropoffLocation}</span>
                </div>
                {pickupTime && dropoffTime && (
                  <div className="flex justify-between text-sm">
                    <span>{t("home.bookingStatus.bookingDate")}</span>
                    <span className="font-medium">
                      {moment(pickupTime).locale(language).format("LLL")}
                      {" — "}
                      {moment(dropoffTime).locale(language).format("LLL")}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span>{t("home.bookingStatus.tickets")}</span>
                <span>
                  {tickets.adult} {tickets.adult === 1 ? t("home.bookingStatus.adult") : t("home.bookingStatus.adults")}
                  {childrenCount > 0 && ` + ${childrenCount} ${t("home.bookingForm.children").toLowerCase()}`}
                </span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between font-medium">
              <span>{t("home.bookingForm.total")}</span>
              <span>
                {symbol}
                {convert(total)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        {onViewDetails && (
          <PDFButton
            receiptData={receiptData}
            buttonVariant="default"
            buttonText={t("home.bookingStatus.downloadReceipt")}
            fileName={`Recibo-${productName?.slice(0, 10)}-${productId.slice(0, 8)}`}
          />
        )}
        {extraFooterAction}
        {onRebook && (
          <Button variant="outline" className="w-full hide-for-pdf" onClick={onRebook}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            {t("home.bookingStatus.makeAnotherReservation")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
