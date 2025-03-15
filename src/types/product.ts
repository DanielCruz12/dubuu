export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  departure_point: string;
  max_people: string;
  duration: number;
  images: string[];
  videos: string[];
  files: string[];
  banner: string;
  product_service: { name: string };
  product_category: { name: string };
  target_product_audience?: { name: string };
  average_rating: number
  total_reviews: number
  user_id: string;
  is_approved?: boolean;
}
