"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/redux/store";

export const paymentAccountApiSlice = createApi({
  reducerPath: "payments", // nombre del slice (puede cambiarse si lo deseas)
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend", // base URL para las peticiones
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    createPaymentAccount: builder.mutation({
      query: (body) => ({
        url: "/api/v1/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Payments", id: "LIST" }],
    }),
  }),
});

export const { useCreatePaymentAccountMutation } = paymentAccountApiSlice;
