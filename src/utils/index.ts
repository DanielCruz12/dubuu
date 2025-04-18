import { Country, Region } from "@/types/payment-types";
import { IProduct, ITourProduct } from "@/types/product";
import { countries } from "./data";

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
