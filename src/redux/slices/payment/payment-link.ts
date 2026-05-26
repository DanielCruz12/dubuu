"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";

export const paymentApiSlice = createApi({
  reducerPath: "payment",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
    prepareHeaders: async (headers, { getState, endpoint }) => {
      // Blink no usa Authorization (igual que en Postman)
      if (endpoint === "createBlinkPayment") return headers;
      const token = (getState() as { auth?: { token?: string | null } }).auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    createPaymentLink: builder.mutation({
      query: (body) => ({
        url: urlWithLocale("/api/enlacePago"),
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),

    create3DSTransaction: builder.mutation({
      query: (body) => ({
        url: urlWithLocale("/api/v1/TransaccionCompra/3DS"),
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),

    /** Crea un pago con Blink (Bitcoin/Lightning). El backend devuelve { paymentRequest, qrCodeUrl?, idTransaccion, booking }. */
    createBlinkPayment: builder.mutation<
      { amount?: number; paymentRequest?: string; idTransaccion?: string; booking?: { id?: string; status?: string } },
      unknown
    >({
      query: (body) => ({
        url: urlWithLocale("/api/v1/TransaccionCompra/blink"),
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),
  }),
});

export const {
  useCreatePaymentLinkMutation,
  useCreate3DSTransactionMutation,
  useCreateBlinkPaymentMutation,
} = paymentApiSlice;
