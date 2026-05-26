import type { IProductBase } from "./product";

export interface IRentalSpecificArea {
  center_lat: number;
  center_lng: number;
  radius_km: number;
  label?: string | null;
  address_text?: string | null;
  created_at?: string;
}

export interface IRentalProduct extends IProductBase<"rental"> {
  rental: {
    delivery_mode: "specific_areas" | "coverage";
    specific_areas: IRentalSpecificArea[];
    coverage_all_country: boolean;
    coverage_departments: string[];
    brand: string;
    model: string;
    year: number;
    condition: "new" | "used" | "refurbished" | "excellent" | "good" | "fair";
    transmission: "automatic" | "manual";
    seating_capacity: number;
    pickup_location?: string;
    max_delivery_distance_km: number;
    base_delivery_fee?: string;
    fee_per_km: string;
    offers_delivery: boolean;
    price_per_day: string;
    available_from: string;
    available_until: string;
    fuel_type: "gasoline" | "diesel" | "electric" | "hybrid";
    is_available: boolean;
    is_approved: boolean;
    is_live: boolean;
    color: string;
    engine: string;
    plate?: string | null;
    vin?: string | null;
    has_gps?: boolean;
    has_deposit?: boolean;
    deposit_amount?: string;
    mileage?: number;
    doors?: number;
    unavailable_dates?: string[];

    booked_ranges?: {
      pickup_date: string;
      return_date: string;
    }[];
  };
}

// Additional types for rental-specific functionality
export interface IRentalAvailability {
  date: string;
  is_available: boolean;
  price_per_day: string;
}

export interface IRentalBooking {
  id: string;
  rental_id: string;
  user_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location?: string;
  total_days: number;
  base_price: string;
  delivery_fee?: string;
  total_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface IRentalDeliveryOptions {
  offers_delivery: boolean;
  max_delivery_distance_km: number;
  fee_per_km: string;
}

// Utility types for rental filtering and searching
export type RentalTransmissionType = "automatic" | "manual";
export type RentalFuelType = "gasoline" | "diesel" | "electric" | "hybrid";
export type RentalCondition =
  | "new"
  | "used"
  | "refurbished"
  | "excellent"
  | "good"
  | "fair";
export type RentalCarType =
  | "sedan"
  | "suv"
  | "hatchback"
  | "coupe"
  | "convertible"
  | "truck"
  | "van"
  | "motorcycle";

export interface IRentalFilters {
  brand?: string;
  model?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  transmission?: RentalTransmissionType;
  fuel_type?: RentalFuelType;
  condition?: RentalCondition;
  type_car?: RentalCarType;
  seating_capacity_min?: number;
  offers_delivery?: boolean;
  available_from?: string;
  available_until?: string;
}
