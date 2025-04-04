export interface Booking {
  id: string;
  user_id: string;
  product_id: string;
  status: "in-process" | "completed" | "canceled";
  payment_link_id: number;
  payment_url: string;
  qr_url: string;
  is_live: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreateBookingInput = Omit<
  Booking,
  "id" | "created_at" | "updated_at"
>;
