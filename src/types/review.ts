export interface Review {
  id: string;
  username: string;
  email: string;
  rating: number;
  review: string;
  created_at?: string;
  updated_at?: string;
}
