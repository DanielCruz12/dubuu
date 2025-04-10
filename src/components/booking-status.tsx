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

type BookingStatusProps = {
  status: "completed" | "in-process" | "canceled";
  productName: string;
  created_at: string;
  tickets: { adult: number };
  total: number;
  onRebook?: () => void;
  onViewDetails?: () => void;
  className?: string;
};

export function BookingStatus({
  status,
  productName,
  tickets,
  total,
  onRebook,
  onViewDetails,
  className,
}: BookingStatusProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      title: "Reserva Completada",
      description: "Tu reserva ha sido confirmada y está lista para disfrutar.",
      color: "text-green-500",
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
    <Card className={cn("overflow-hidden", config.borderColor, className)}>
      <div className={cn("h-2", config.bgColor)} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            <CardTitle className="text-base">{config.title}</CardTitle>
          </div>
          <Badge variant={"default"}>{config.badgeText}</Badge>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-sm pl-2">{productName}</h3>
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
          <Button variant="outline" className="w-full" onClick={onRebook}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reservar de nuevo
          </Button>
        )}
        {onViewDetails && (
          <Button
            variant={status === "canceled" ? "default" : "outline"}
            className="w-full"
            onClick={onViewDetails}
          >
            Descargar recibo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
