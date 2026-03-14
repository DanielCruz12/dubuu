import { Country, Region } from "@/types/payment-types";
import { IProduct, ITourProduct } from "@/types/product";
import { countries } from "./data";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Landmark,
  Zap,
} from "lucide-react";
import type { PaymentMethod } from "@/types/payment-types";

// Type guard para tours
export function isTourProduct(product: IProduct): product is ITourProduct {
  return isProductType(product, "tours");
}

// Genérico: helper para comparar tipos de producto
// Soporta alias en distintos idiomas (ej. "tours" / "viajes")
export function isProductType<T extends string>(
  product: IProduct,
  type: T,
): product is Extract<IProduct, { product_type: { name: T } }> {
  const rawName = product.product_type?.name?.toLowerCase();
  const target = type.toLowerCase();

  const aliases: Record<string, string[]> = {
    tours: ["tours", "tour", "viajes", "viaje"],
    rental: ["rental", "rentals", "alquiler", "alquileres"],
  };

  const allowedNames = aliases[target] ?? [target];

  return !!rawName && allowedNames.includes(rawName);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calculateTotal = ({ watchData, product }: any): number => {
  const ticketTotal = watchData.tickets.adult * product.price;
  const iva = ticketTotal * 0.13;
  const turismo = ticketTotal * 0.05;
  const serviceFee = ticketTotal * 0.03;
  return parseFloat((ticketTotal + iva + turismo + serviceFee).toFixed(2));
};

export const getCountryById = (id: string): Country | undefined => {
  return countries.find((country) => country.id === id);
};

export const getRegionById = (
  countryId: string,
  regionId: string,
): Region | undefined => {
  const country = getCountryById(countryId);
  if (!country) return undefined;
  return country.regiones.find((region) => region.id === regionId);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAvailableCountries(tours: any[]): string[] {
  // Using Array.from instead of spread operator for better compatibility
  return Array.from(new Set(tours.map((tour) => tour.country)));
}

export function getPaymentMethodIcon(method: PaymentMethod | null) {
  switch (method) {
    case "bank":
      return <Landmark className="h-5 w-5" />;
    case "blink":
      return <Zap className="h-5 w-5" />;
    case "visa":
    case "mastercard":
      return <CreditCard className="h-5 w-5" />;
    default:
      return null;
  }
}

/** Returns i18n key for the payment method name. Use with t(key) in components. */
export function getPaymentMethodName(method: PaymentMethod | null): string {
  switch (method) {
    case "bank":
      return "dashboard.payments.methods.bank";
    case "blink":
      return "dashboard.payments.methods.blink";
    default:
      return "";
  }
}

export function calculateRentalPrice(
  pricePerDay: number,
  from: Date,
  to: Date,
): number {
  const msInHour = 1000 * 60 * 60;
  const totalHours = Math.ceil((to.getTime() - from.getTime()) / msInHour);

  if (totalHours <= 0) throw new Error("El rango de fechas es inválido");
  if (totalHours > 24 * 15) throw new Error("Máximo de 15 días por alquiler");

  const fullDays = Math.floor(totalHours / 24);
  const extraHours = totalHours % 24;

  const pricePerHour = (pricePerDay / 24) * 1.5; // 50% más caro por hora
  const total = fullDays * pricePerDay + extraHours * pricePerHour;

  return parseFloat(total.toFixed(2));
}

export const statusConfig = {
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
