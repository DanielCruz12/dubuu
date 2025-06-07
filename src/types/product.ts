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
  category_id: {
    id: string;
    name: string;
  };
}

export interface IProductAudience {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface IProductBase<T extends string = string> {
  id: string;
  name: string;
  user_id: string;
  description: string;
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
  user?: { id: string; username: string; email: string }[];
  product_type: { name: T };
  created_at: string;
  updated_at: string;
}

export interface ITourProductDates {
  id: string;
  date: string;
  max_people: number;
  people_booked: number;
}

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
  };
}

export type IProduct = ITourProduct | IRentalProduct;
