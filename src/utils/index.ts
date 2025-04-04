import { IProduct, ITourProduct } from "@/types/product";

// Type guard para tours
export function isTourProduct(product: IProduct): product is ITourProduct {
  return product.product_type?.name === "tour";
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
