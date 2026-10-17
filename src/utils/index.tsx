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
import {
  PRODUCT_TYPE_ALIASES,
  parseProductTypeParam,
  resolveProductTypeKey,
} from "@/constants/product-type";

export {
  DEFAULT_PRODUCT_TYPE_QUERY,
  ProductTypeKey,
  PRODUCT_TYPE_ALIASES,
  formKindToProductTypeKey,
  getProductTypeSearchAliases,
  normalizeProductTypeName,
  parseProductTypeParam,
  productTypeKeyToFormKind,
  productTypeNameToFormKind,
  resolveProductTypeKey,
} from "@/constants/product-type";
export type { ProductFormKind } from "@/constants/product-type";

// Type guard para tours
export function isTourProduct(product: IProduct): product is ITourProduct {
  return isProductType(product, "tours");
}

// Genérico: comparar tipo de producto (alias + resolución desde nombre API)
export function isProductType<T extends string>(
  product: IProduct,
  type: T,
): product is Extract<IProduct, { product_type: { name: T } }> {
  const inferred = resolveProductTypeKey(product.product_type?.name);
  const wanted = parseProductTypeParam(String(type));

  if (inferred !== null && wanted !== null) {
    return inferred === wanted;
  }

  const rawName = product.product_type?.name?.toLowerCase().trim() ?? "";
  if (!rawName) return false;

  if (wanted !== null) {
    return PRODUCT_TYPE_ALIASES[wanted].some((a) => a.toLowerCase() === rawName);
  }

  return rawName === String(type).toLowerCase();
}

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

export const statusConfig = {
  completed: {
    icon: CheckCircle,
    title: "Reserva Completada",
    description:
      "Tu reserva ha sido confirmada, porfavor verifica los datos de la reserva.",
    color: "text-green-500 dark:text-green-200",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    badgeVariant: "outline" as const,
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
    badgeVariant: "outline" as const,
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
    badgeVariant: "outline" as const,
    badgeText: "Cancelada",
  },
};
