/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { RefreshCcw } from "lucide-react";
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
import { useCurrency } from "@/hooks/use-currency-converter";

type BookingStatusProps = {
  id: string;
  status: "completed" | "in-process" | "canceled";
  productName?: string;
  productId: string;
  product: any;
  paymentMethod: string;
  user: any;
  created_at: string;
  tickets: { adult: number };
  total: number;
  onRebook?: () => void;
  onViewDetails?: () => void;
  className?: string;
};

export function BookingStatus({
  id,
  status,
  paymentMethod,
  productId,
  productName,
  product,
  created_at,
  tickets,
  user,
  total,
  onRebook,
  onViewDetails,
  className,
}: BookingStatusProps) {
  const { t } = useLanguage();
  const receiptData: ReceiptProps = {
    receiptNumber: productId,
    date: new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    customerName: user?.fullName,
    customerEmail: user.primaryEmailAddress,
    items: [
      {
        id: tickets.adult.toString(),
        description: productName as string,
        quantity: tickets.adult,
        price: product.price,
      },
    ],
    subtotal: (product.price as number) * tickets.adult,
    total: total,
    notes: t("home.bookingStatus.receiptNotes"),
    companyName: "Dubuu",
    companyLogo: "/logo.svg",
    companyAddress: "El Salvador, La Libertad",
    companyPhone: "+503 77886116",
    companyEmail: "support@dubuu.com",
    companyWebsite: "https://www.dubuu.com",
    qrValue: "https://miempresa.com/verificar/INV-2023-001",
    paymentMethod: "Transferencia Bancaria",
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

  const { convert, symbol } = useCurrency();

  return (
    <Card
      id={`booking-status-${id}`}
      className={cn("overflow-hidden", config.borderColor, className)}
    >
      <div className={cn("h-2", config.bgColor)} />
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
              <div className="flex justify-between">
                <span className="text-gray-500">{t("home.bookingStatus.bookingDate")}</span>
                <span className="font-normal">
                  {moment(created_at).format("LLL")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("home.bookingStatus.paymentMethod")}</span>
                <span className="font-normal">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("home.bookingStatus.tickets")}</span>
              <span>
                {tickets.adult} {tickets.adult === 1 ? t("home.bookingStatus.adult") : t("home.bookingStatus.adults")}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-medium">
              <span>{t("home.bookingForm.total")}</span>
              <span>
                {symbol}
                {convert(total)}{" "}
                <span className="text-sm text-muted-foreground">{t("home.bookingForm.perPerson")}</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        {status === "canceled" && onRebook && (
          <Button
            variant="outline"
            className="w-full hide-for-pdf"
            onClick={onRebook}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            {t("home.bookingStatus.rebook")}
          </Button>
        )}
        {onViewDetails && (
          <PDFButton
            receiptData={receiptData}
            buttonVariant="outline"
            buttonText={t("home.bookingStatus.downloadReceipt")}
            fileName={`Recibo-${productName?.slice(0, 10)}-${productId.slice(0, 8)}`}
          />
        )}
      </CardFooter>
    </Card>
  );
}
