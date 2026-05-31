export interface Booking {
  id: string;
  user_id: string;
  product_id: string;
  status?: "in-process" | "completed" | "canceled";
  tickets?: number;
  total: number;
  paymentMethod: string;
  selected_dates?: string[];
  is_live: boolean;
  created_at: string;
  updated_at: string;
  idTransaccion: string;
}

export interface IBookingUser {
  id: string
  tickets: number
  total: string
  status: string
  product_id: string
  product_name: string
  product_banner: string
  product_address: string
  country: string
  product_description: string
  tourDate: string
  booking_kind?: string
  paymentMethod?: string
  pickup_location?: string
  dropoff_location?: string
  pickup_time?: string
  dropoff_time?: string
}

export type CreateBookingInput = Omit<
  Booking,
  "id" | "created_at" | "updated_at"
>;

export interface IBooking {
  id: string;
  user_id: string;
  product_id: string;
  date: string;
  status: string
  tickets: number;
  total: number;
  paymentMethod: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  // Puedes añadir más campos según sea necesario
}

export type TourBookingData = {
  kind: 'tour';
  datetime: string;
  tickets: { adult: number; children: number };
  addons: string[];
  total: number;
  user_id: string;
  product_id: string;
};

export type RentalBookingData = {
  kind: 'rental';
  pickup_time: string;
  dropoff_time: string;
  pickup_location: string;
  dropoff_location: string;
  total: number;
  user_id: string;
  product_id: string;
  /** Files to be uploaded during booking creation (single multipart request) */
  duiFrontFile?: File | null;
  duiBackFile?: File | null;
  licenseFrontFile?: File | null;
  licenseBackFile?: File | null;
  /** Formatted local date string for notifications (e.g. "27 may 2026 a las 10:00 AM") */
  start_date_display?: string;
  /** Formatted local date string for notifications */
  end_date_display?: string;
  /** Google Maps search link for the pickup location */
  maps_link?: string;
  /** Vehicle model name for notifications */
  vehicle_model?: string;
};

export type BookingFormData = TourBookingData | RentalBookingData;

export interface HostBooking {
  bookingId: string;
  booking_kind: string;
  tickets: number | null;
  total: string;
  productId: string;
  user: {
    first_name: string | null;
    username: string | null;
    last_name: string | null;
    email: string | null;
  };
  status: string;
  name: string;
  tourDate: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  pickup_notes?: string | null;
  dropoff_notes?: string | null;
  dui_front?: string | null;
  dui_back?: string | null;
  license_front?: string | null;
  license_back?: string | null;
  createdAt: string;
  updatedAt: string;
}
