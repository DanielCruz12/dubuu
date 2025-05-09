/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { calculatePriceWithTaxes } from "@/lib/price";

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
        price: calculatePriceWithTaxes(product.price),
      },
    ],
    subtotal:
      (calculatePriceWithTaxes(product.price) as number) * tickets.adult,
    total: total,
    notes:
      "Gracias por confiar en nuestros servicios. Este recibo sirve como comprobante de pago.",
    companyName: "Dubuu",
    companyLogo: "/logo.svg",
    companyAddress: "El Salvador, La Libertad",
    companyPhone: "+503 77886116",
    companyEmail: "team@lappsnet.com",
    companyWebsite: "https://www.dubuu.com",
    qrValue: "https://miempresa.com/verificar/INV-2023-001",
    paymentMethod: "Transferencia Bancaria",
    paymentStatus: "Completado",
  };

  const config = statusConfig[status];
  const Icon = config.icon;

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
            <h3 className="text-base font-semibold mb-4">Información</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nº de Reserva</span>
                <span className="font-normal">#{id.slice(0, 13)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha de Reserva</span>
                <span className="font-normal">
                  {moment(created_at).format("LLL")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Método de Pago</span>
                <span className="font-normal">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Entradas:</span>
              <span>
                {tickets.adult} {tickets.adult === 1 ? "adulto" : "adultos"}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
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
            Reservar de nuevo
          </Button>
        )}
        {onViewDetails && (
          <PDFButton
            receiptData={receiptData}
            buttonVariant="outline"
            buttonText="Descargar Recibo"
            fileName={`Recibo-${productName?.slice(0, 10)}-${productId.slice(0, 8)}`}
          />
        )}
      </CardFooter>
    </Card>
  );
}
