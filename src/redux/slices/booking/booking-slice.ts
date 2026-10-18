"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Booking, HostBooking, IBookingUser } from "@/types/booking";
import { urlWithLocale } from "@/redux/url-with-locale";

export type CreateBookingInput = Omit<
  Booking,
  // La reserva se crea ANTES de iniciar la transacción de pago (3DS):
  // idTransaccion llega después, cuando el backend liga la transacción.
  "id" | "created_at" | "updated_at" | "idTransaccion"
> & {
  tour_date_id?: string | string[];
  idTransaccion?: string;
};

// Definimos el API slice sin depender de hooks de React
export const bookingsApiSlice = createApi({
  reducerPath: "bookingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
    prepareHeaders: async (headers, { getState }) => {
      // Obtenemos el token del estado de Redux (lo añadiremos después)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (getState() as any).auth?.token;

      // Si tenemos un token, lo añadimos al header
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Bookings"],
  endpoints: (builder) => ({
    // 🔹 Get bookings by user
    getBookingsByUserId: builder.query<IBookingUser[], string>({
      query: (userId) => urlWithLocale(`/api/v1/bookings/user/${userId}`),
      providesTags: (result) =>
        result
          ? [
              { type: "Bookings", id: "USER_LIST" },
              ...result.map(({ id }) => ({ type: "Bookings" as const, id })),
            ]
          : [{ type: "Bookings", id: "USER_LIST" }],
    }),

    // 🔹 Get bookings by product
    getBookingsByUserIdProductId: builder.query<
      HostBooking[],
      { productId: string; userId: string }
    >({
      query: ({ productId, userId }) =>
        `/api/v1/bookings/products/${userId}/${productId}`,
      providesTags: (result) =>
        result
          ? [
              { type: "Bookings", id: "PRODUCT_LIST" },
              ...result.map(({ bookingId }) => ({ type: "Bookings" as const, id: bookingId })),
            ]
          : [{ type: "Bookings", id: "PRODUCT_LIST" }],
    }),

    // 🔹 Get a single booking
    getBookingById: builder.query<Booking, string>({
      query: (id) => urlWithLocale(`/api/v1/bookings/${id}`),
      providesTags: (result, error, id) => [{ type: "Bookings", id }],
    }),

    // 🔹 Create booking (accepts FormData for rental with files, or JSON object for tours)
    createBooking: builder.mutation<Booking, CreateBookingInput | FormData>({
      query: (data) => ({
        url: urlWithLocale("/api/v1/bookings/"),
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Bookings", id: "LIST" }],
    }),

    // 🔹 Delete booking
    deleteBooking: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: urlWithLocale(`/api/v1/bookings/${id}`),
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Bookings", id },
        { type: "Bookings", id: "LIST" },
      ],
    }),
  }),
});

// Exportamos los hooks generados por RTK Query
export const {
  useGetBookingsByUserIdQuery,
  useGetBookingsByUserIdProductIdQuery,
  useGetBookingByIdQuery,
  useLazyGetBookingByIdQuery,
  useCreateBookingMutation,
  useDeleteBookingMutation,
} = bookingsApiSlice;
