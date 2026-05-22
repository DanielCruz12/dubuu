import { IRentalProduct } from "./rental";

export interface IProductTypes {
  id: string;
  name: string;
  description: string;
}
export interface IProductCategory {
  id: string;
  name: string;
  description: string;
  product_type: {
    id: string;
    name: string;
  };
}

export interface IProductAmenity {
  id: string;
  name: string;
  description: string;
  // La API a veces devuelve `category_id` como string (id),
  // y en otros casos como objeto (id + name).
  category_id: string | { id: string; name: string };
}

export interface IProductAudience {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

/** Estado por fila en `tour_dates` (API). */
export type TourDateStatus = "active" | "cancelled" | "completed";

export interface IProductBase<T extends string = string> {
  id: string;
  name: string;
  user_id: string;
  description: string;
  /** En tours puede ser el precio mínimo entre fechas (calculado en listados). */
  price: number;
  address: string;
  country: string;
  is_approved?: boolean;
  is_active?: boolean;
  images: string[];
  videos: string[];
  files: string[];
  banner: string;
  average_rating: number | string;
  total_reviews: number;
  product_category: { id: string; name: string };
  target_audience?: { id: string; name: string };
  amenities?: { id: string; name: string }[];
  user?: { id: string; username: string; email?: string } | { id: string; username: string; email?: string }[];
  product_type: { id?: string; name: T };
  created_at: string;
  updated_at: string;
}

export interface ITourProductDates {
  id: string;
  date: string;
  max_people: number;
  people_booked: number;
  /** Precio por persona para esta fecha (obligatorio en API actual). */
  price?: number;
  /** Precio especial para niños (solo cuando el tour acepta niños). */
  children_price?: number | null;
  status?: TourDateStatus;
}

/** Body JSON para PATCH de fechas de tour (además de campos generales del producto). */
export interface PatchTourDateFields {
  selectedDateId?: string;
  update_all_tour_dates?: boolean;
  price?: number;
  max_people?: number;
  status?: TourDateStatus;
}

export type PatchTourProductBody = PatchTourDateFields & {
  user_id: string;
  name?: string;
  description?: string;
  address?: string;
  departure_point?: string;
  country?: string;
  locale?: string;
};

export interface ITourProduct extends IProductBase<"tours"> {
  tour: {
    departure_point: string;
    tour_dates: ITourProductDates[];
    itinerary: string[];
    highlight: string;
    included: string;

    expenses: string[];
    difficulty: string;
    packing_list: string[];

    lat: number;
    long: number;
    duration: number;
    accepts_children?: boolean;
  };
}

export interface Destination {
  id: string;
  name: string;
  image: string;
  tours: number;
  activities: number;
  category: string;
  duration: string;
  country: string;
  rating: number;
  priceRange: number;
}

export type IProduct = ITourProduct | IRentalProduct;

export interface UpdateProductResponse {
  product: IProduct;
  tourDates?: ITourProductDates[];
}
