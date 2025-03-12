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
  product_service_id: string;
  product_category_id: string;
  target_product_audience_id: string;
  user_id: string;
  is_approved?: boolean;
}
