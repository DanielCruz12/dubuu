import type { IProduct, ITourProduct } from "@/types/product";
import type { IRentalProduct } from "@/types/rental";
import { isProductType } from "@/utils";

export function isTourProduct(product: IProduct): product is ITourProduct {
  return isProductType(product, "tours");
}

export function isRentalProduct(product: IProduct): product is IRentalProduct {
  return isProductType(product, "rental");
}

export function getProductDisplayPrice(product: IProduct): number {
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
    return {
      type: "rental" as const,
      brand: product.rental.brand,
      model: product.rental.model,
      year: product.rental.year,
      transmission: product.rental.transmission,
      seatingCapacity: product.rental.seating_capacity,
      fuelType: product.rental.fuel_type,
      condition: product.rental.condition,
      mileage: product.rental.mileage,
      typecar: product.rental.type_car,
      color: product.rental.color,
      doors: product.rental.doors,
      engine: product.rental.engine,
      pickupLocation: product.rental.pickup_location,
      offersDelivery: product.rental.offers_delivery,
      maxDeliveryDistance: product.rental.max_delivery_distance_km,
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
    return product.rental.pickup_location;
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
  if (needsDelivery && rental.rental.offers_delivery) {
    deliveryFee = Number.parseFloat(rental.rental.base_delivery_fee);
    if (deliveryDistance > 0) {
      deliveryFee +=
        deliveryDistance * Number.parseFloat(rental.rental.fee_per_km);
    }
  }

  return {
    days,
    basePrice,
    deliveryFee,
    total: basePrice + deliveryFee,
  };
}
