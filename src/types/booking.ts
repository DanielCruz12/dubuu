export interface Booking {
  id: string;
  user_id: string;
  product_id: string;
  status?: "in-process" | "completed" | "canceled";
  tickets?: number;
  total?: number;
  paymentMethod: string;
  is_live: boolean;
  created_at: string;
  updated_at: string;
  idTransaccion: string;
}

export type CreateBookingInput = Omit<
  Booking,
  "id" | "created_at" | "updated_at"
>;
