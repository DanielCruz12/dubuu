export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  departure_point: string;
  max_people: string;

  address: string;
  country: string;
  available_dates: Date[];
  itinerary: string[];
  highlight: string;
  included: string;

  duration: number;
  images: string[];
  videos: string[];
  files: string[];
  banner: string;
  product_category: { name: string };
  target_audience?: { name: string };
  average_rating: number;
  total_reviews: number;
  user_id: string;
  is_approved?: boolean;
}
