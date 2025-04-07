"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApiSlice = createApi({
  reducerPath: "payment", // nombre del slice (puede cambiarse si lo deseas)
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend", // base URL para las peticiones
  }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    createPaymentLink: builder.mutation({
      query: (body) => ({
        url: "/api/enlacePago",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),

    create3DSTransaction: builder.mutation({
      query: (body) => ({
        url: "/api/v1/TransaccionCompra/3DS",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),
  }),
});

export const { useCreatePaymentLinkMutation, useCreate3DSTransactionMutation } =
  paymentApiSlice;
