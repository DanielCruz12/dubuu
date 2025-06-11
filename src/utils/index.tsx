import { Country, Region } from "@/types/payment-types";
import { IProduct, ITourProduct } from "@/types/product";
import { countries } from "./data";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Landmark,
} from "lucide-react";
import type { PaymentMethod } from "@/types/payment-types";

// Type guard para tours
export function isTourProduct(product: IProduct): product is ITourProduct {
  return product.product_type?.name === "tours";
}

// Type guard para rentals
/* export function isRentalProduct(product: IProduct): product is IRentalProduct {
  return product.product_type?.name === "rental";
} */

// Genérico: puedes usar cualquier string literal si el tipado está bien
export function isProductType<T extends string>(
  product: IProduct,
  type: T
): product is Extract<IProduct, { product_type: { name: T } }> {
  return product.product_type?.name === type;
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
  regionId: string
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
    case "visa":
    case "mastercard":
      return <CreditCard className="h-5 w-5" />;
    default:
      return null;
  }
}

export function getPaymentMethodName(method: PaymentMethod | null) {
  switch (method) {
    case "bank":
      return "Transferencia bancaria";
    case "visa":
      return "Tarjeta Visa";
    case "mastercard":
      return "Tarjeta Mastercard";
    default:
      return "";
  }
}

export function calculateRentalPrice(
  pricePerDay: number,
  from: Date,
  to: Date
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
