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

export interface ITourProduct extends IProductBase<"tours"> {
  tour: {
    departure_point: string;
    max_people: number;
    available_dates: Date[];
    itinerary: string[];
    highlight: string;
    included: string;
    duration: number;
  };
}

export type IProduct = ITourProduct | IRentalProduct;

export interface IProductTypes {
  id: string;
  name: string;
  description: string;
}
