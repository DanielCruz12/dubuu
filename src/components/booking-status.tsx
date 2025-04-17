"use client";

import { CheckCircle, Clock, AlertTriangle, RefreshCcw } from "lucide-react";
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
import PDFButton from "./pdf/pdf-button";
import { ReceiptProps } from "./pdf/pdf-template";

type BookingStatusProps = {
  id: string;
  status: "completed" | "in-process" | "canceled";
  productName?: string;
  productId: string;
  paymentMethod: string;
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
  created_at,
  tickets,
  total,
  onRebook,
  onViewDetails,
  className,
}: BookingStatusProps) {
  const receiptData: ReceiptProps = {
    receiptNumber: "INV-2023-001",
    date: "17/04/2023",
    dueDate: "17/05/2023",
    customerName: "Juan Pérez",
    customerEmail: "juan.perez@ejemplo.com",
    customerAddress: "Calle Principal 123, Madrid, España",
    items: [
      {
        id: "1",
        description: "Desarrollo de sitio web",
        quantity: 1,
        price: 1200,
      },
      {
        id: "2",
        description: "Diseño de logo",
        quantity: 1,
        price: 300,
      },
      {
        id: "3",
        description: "Mantenimiento mensual",
        quantity: 3,
        price: 100,
      },
    ],
    subtotal: 1800,
    tax: 0.21,
    total: 2178,
    notes:
      "El pago debe realizarse en un plazo de 30 días. Gracias por confiar en nuestros servicios.",
    companyName: "Mi Empresa S.L.",
    companyLogo: "/abstract-geometric-logo.png",
    companyAddress: "Avenida Empresarial 456, Barcelona, España",
    companyPhone: "+34 612 345 678",
    companyEmail: "info@miempresa.com",
    companyWebsite: "www.miempresa.com",
    qrValue: "https://miempresa.com/verificar/INV-2023-001",
    paymentMethod: "Transferencia Bancaria",
    paymentStatus: "Paid",
  };

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      title: "Reserva Completada",
      description:
        "Tu reserva ha sido confirmada, porfavor verifica los datos de la reserva.",
      color: "text-green-500 dark:text-green-200",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      badgeVariant: "success" as const,
      badgeText: "Completada",
    },
    "in-process": {
      icon: Clock,
      title: "Reserva en Proceso",
      description:
        "Tu reserva está siendo procesada. Pronto recibirás confirmación.",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      badgeVariant: "warning" as const,
      badgeText: "En Proceso",
    },
    canceled: {
      icon: AlertTriangle,
      title: "Reserva Cancelada",
      description:
        "Esta reserva ha sido cancelada. Puedes realizar una nueva reserva si lo deseas.",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      badgeVariant: "destructive" as const,
      badgeText: "Cancelada",
    },
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
            fileName={`Recibo-${productId.slice(0, 8)}`}
          />
        )}
      </CardFooter>
    </Card>
  );
}
