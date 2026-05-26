export interface Review {
  id: string;
  user_id: string;
  username: string;
  product_id: string;
  email: string;
  rating: number;
  review: string;
  image_url?: string;
  images?: string[] | File[];
  created_at?: string;
  updated_at?: string;
}
