"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Booking } from "@/types/booking";

export type CreateBookingInput = Omit<
  Booking,
  "id" | "created_at" | "updated_at"
>;

export const bookingsApiSlice = createApi({
  reducerPath: "bookingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
  }),
  tagTypes: ["Bookings"],
  endpoints: (builder) => ({
    // 🔹 Get all bookings
    getBookings: builder.query<Booking[], void>({
      query: () => "/api/v1/bookings/",
      providesTags: (result) =>
        result
          ? [
              { type: "Bookings", id: "LIST" },
              ...result.map(({ id }) => ({ type: "Bookings" as const, id })),
            ]
          : [{ type: "Bookings", id: "LIST" }],
    }),

    // 🔹 Get a single booking
    getBookingById: builder.query<Booking, string>({
      query: (id) => `/api/v1/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: "Bookings", id }],
    }),

    // 🔹 Get bookings by user
    getBookingsByUserId: builder.query<Booking[], string>({
      query: (userId) => `/api/v1/bookings/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              { type: "Bookings", id: "USER_LIST" },
              ...result.map(({ id }) => ({ type: "Bookings" as const, id })),
            ]
          : [{ type: "Bookings", id: "USER_LIST" }],
    }),

    // 🔹 Get bookings by product
    getBookingsByProductId: builder.query<Booking[], string>({
      query: (productId) => `/api/v1/bookings/product/${productId}`,
      providesTags: (result) =>
        result
          ? [
              { type: "Bookings", id: "PRODUCT_LIST" },
              ...result.map(({ id }) => ({ type: "Bookings" as const, id })),
            ]
          : [{ type: "Bookings", id: "PRODUCT_LIST" }],
    }),

    // 🔹 Create booking
    createBooking: builder.mutation<Booking, CreateBookingInput>({
      query: (data) => ({
        url: "/api/v1/bookings/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Bookings", id: "LIST" }],
    }),

    // 🔹 Delete booking
    deleteBooking: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/v1/bookings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Bookings", id },
        { type: "Bookings", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useGetBookingsByUserIdQuery,
  useGetBookingsByProductIdQuery,
  useCreateBookingMutation,
  useDeleteBookingMutation,
} = bookingsApiSlice;
