export interface Booking {
  id: string
  user_id: string;
  product_id: string;
  status?: "in-process" | "completed" | "canceled";
  tickets?: number;
  total?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_region: string;
  country: string;
  zip_code: string;
  paymentMethod: string;
  is_live: boolean;
  created_at: string;
  updated_at: string;
  idTransaccion: string;
  urlCompletarPago3Ds: string;
}

export type CreateBookingInput = Omit<
  Booking,
  "id" | "created_at" | "updated_at"
>;
