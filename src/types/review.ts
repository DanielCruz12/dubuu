export interface Review {
  id: string;
  username: string;
  email: string;
  rating: number;
  review: string;
  images?: string[] | File[];
  created_at?: string;
  updated_at?: string;
}
