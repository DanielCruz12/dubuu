import { IRentalProduct } from "./rental";

export interface IProductBase<T extends string = string> {
  id: string;
  name: string;
  description: string;
  price: number;
  address: string;
  country: string;
  images: string[];
  videos: string[];
  files: string[];
  banner: string;
  product_category: { name: string };
  target_audience?: { name: string };
  average_rating: number;
  amenities: { name: string }[];
  total_reviews: number;
  user_id: string;
  is_approved?: boolean;
  product_type: { name: T };
}

export interface ITourProductDates {
  id: string;
  date: string;
  max_people: number;
  people_booked: number;
  available_spots?: number;
}

export interface ITourProduct extends IProductBase<"tours"> {
  tour: {
    departure_point: string;
    tour_dates: ITourProductDates[];
    itinerary: string[];
    highlight: string;
    included: string;
    lat: number;
    long: number;
    duration: number;
  };
}

export type IProduct = ITourProduct | IRentalProduct;

export interface IProductTypes {
  id: string;
  name: string;
  description: string;
}
