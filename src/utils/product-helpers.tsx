import type { IProduct, ITourProduct } from "@/types/product";
import type { IRentalProduct } from "@/types/rental";
import { isProductType } from "@/utils";

export function isTourProduct(product: IProduct): product is ITourProduct {
  return isProductType(product, "tours");
}

export function isRentalProduct(product: IProduct): product is IRentalProduct {
  return isProductType(product, "rental");
}

/** Algunas respuestas API marcan `product_type` como alquiler sin incluir el objeto `rental`. */
export function isRentalProductComplete(product: IProduct): product is IRentalProduct {
  return isRentalProduct(product) && !!(product as IRentalProduct).rental;
}

export function getProductDisplayPrice(product: IProduct): number {
  if (isRentalProduct(product)) {
    const rental = (product as IRentalProduct).rental;
    const perDay = rental
      ? Number.parseFloat(String(rental.price_per_day ?? ""))
      : Number.NaN;
    if (Number.isFinite(perDay) && perDay > 0) return perDay;
    const direct = Number(product.price);
    if (Number.isFinite(direct) && direct > 0) return direct;
    return 0;
  }

  const direct = Number(product.price);
  if (Number.isFinite(direct) && direct > 0) return direct;

  if (isTourProduct(product)) {
    const prices = (product.tour?.tour_dates ?? [])
      .map((d) => Number(d?.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length > 0) return Math.min(...prices);
  }

  return 0;
}

export function getProductLocationData(product: IProduct): {
  lat: number;
  lng: number;
} {
  if (isTourProduct(product)) {
    return {
      lat: product.tour.lat,
      lng: product.tour.long,
    };
  }

  if (isRentalProduct(product)) {
    // For rentals, you might need to implement geocoding for pickup_location
    // or add lat/lng fields to the rental object in the future
    return {
      lat: 0, // Default coordinates - implement geocoding here
      lng: 0,
    };
  }

  return { lat: 0, lng: 0 };
}

export function getProductSpecificInfo(product: IProduct) {
  if (isTourProduct(product)) {
    return {
      type: "tour" as const,
      duration: product.tour.duration,
      difficulty: product.tour.difficulty,
      departurePoint: product.tour.departure_point,
      highlight: product.tour.highlight,
      included: product.tour.included,
      itinerary: product.tour.itinerary,
    };
  }

  if (isRentalProduct(product)) {
    const ren = (product as IRentalProduct).rental;
    if (!ren) {
      return { type: "unknown" as const };
    }
    return {
      type: "rental" as const,
      brand: ren.brand,
      model: ren.model,
      year: ren.year,
      transmission: ren.transmission,
      seatingCapacity: ren.seating_capacity,
      fuelType: ren.fuel_type,
      condition: ren.condition,
      mileage: ren.mileage,
      typecar: ren.type_car,
      color: ren.color,
      doors: ren.doors,
      engine: ren.engine,
      pickupLocation: ren.pickup_location,
      offersDelivery: ren.offers_delivery,
      maxDeliveryDistance: ren.max_delivery_distance_km,
    };
  }

  return { type: "unknown" as const };
}

export function formatPrice(product: IProduct): string {
  const basePrice = `$${product.price}`;

  if (isRentalProduct(product)) {
    return `${basePrice}/día`;
  }

  if (isTourProduct(product)) {
    return `${basePrice}/persona`;
  }

  return basePrice;
}

export function getLocationTitle(product: IProduct): string {
  if (isTourProduct(product)) {
    return "Punto de salida";
  }

  if (isRentalProduct(product)) {
    return "Ubicación de recogida";
  }

  return "Ubicación";
}

export function getDisplayAddress(product: IProduct): string {
  if (isRentalProduct(product)) {
    const pickup = (product as IRentalProduct).rental?.pickup_location;
    return pickup || product.address || "";
  }

  return product.address;
}

// Utility function to calculate rental total price
export function calculateRentalPrice(
  rental: IRentalProduct,
  startDate: string,
  endDate: string,
  needsDelivery = false,
  deliveryDistance = 0
): {
  days: number;
  basePrice: number;
  deliveryFee: number;
  total: number;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const basePrice = Number.parseFloat(rental.rental.price_per_day) * days;

  let deliveryFee = 0;
  if (needsDelivery && rental.rental.offers_delivery && deliveryDistance > 0) {
    deliveryFee =
      deliveryDistance * Number.parseFloat(String(rental.rental.fee_per_km ?? "0"));
  }

  return {
    days,
    basePrice,
    deliveryFee,
    total: basePrice + deliveryFee,
  };
}
