import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Country } from "@/types/payment-types";
import { countries } from "@/utils/data";

const COMPANY_PHONE = "+503 6456-2432";

export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return "—";
  const parsed = parsePhoneNumberFromString(phone);
  if (!parsed) return phone;
  const national = parsed.nationalNumber;
  const formatted = national.replace(/^(\d{4})(\d+)$/, "$1-$2");
  return `+${parsed.countryCallingCode} ${formatted}`;
}

export function getCompanyPhone(): string {
  return COMPANY_PHONE;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type MutationMessages = {
  success?: string;
  error: string;
};

export const withToast = async <T>(
  mutationFn: Promise<T>,
  messages: Partial<MutationMessages>
) => {
  const { success, error } = messages;

  try {
    const result = await mutationFn;
    if (success) toast.success(success);
    return result;
  } catch (err) {
    if (error) toast.error(error);
    throw err;
  }
};

export const toSlug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");

export function getCountryNameByCode(
  id: string,
  countriesList: Country[] = countries
): string | null {
  const country = countriesList.find(
    (c) => c.id.toUpperCase() === id.toUpperCase()
  );
  return country ? country.nombre : null;
}

export function generateSlug(
  name: string,
  countryCode: string,
  productType: string,
  productCategory?: string
): string {
  const countryName = getCountryNameByCode(countryCode) || "desconocido";

  return toSlug(
    `${name} ${countryName} ${productCategory || ""} ${productType}`
  );
}
