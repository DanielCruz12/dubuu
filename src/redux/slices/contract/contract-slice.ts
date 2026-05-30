"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  IContract,
  IContractChecklist,
  CreateChecklistPayload,
} from "@/types/contract";
import { urlWithLocale } from "@/redux/url-with-locale";

export const contractsApiSlice = createApi({
  reducerPath: "contractsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
    prepareHeaders: async (headers, { getState }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Contracts", "Checklists"],
  endpoints: (builder) => ({
    getContractByBookingId: builder.query<IContract, string>({
      query: (bookingId) =>
        urlWithLocale(`/api/v1/contracts/booking/${bookingId}`),
      providesTags: (result, error, bookingId) => [
        { type: "Contracts", id: bookingId },
      ],
    }),

    createContract: builder.mutation<IContract, string>({
      query: (bookingId) => ({
        url: urlWithLocale("/api/v1/contracts/"),
        method: "POST",
        body: { booking_id: bookingId },
      }),
      invalidatesTags: (result, error, bookingId) => [
        { type: "Contracts", id: bookingId },
      ],
    }),

    updateContractStatus: builder.mutation<
      IContract,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: urlWithLocale(`/api/v1/contracts/${id}/status`),
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result) =>
        result ? [{ type: "Contracts", id: result.booking_id }] : ["Contracts"],
    }),

    createChecklist: builder.mutation<
      IContractChecklist,
      CreateChecklistPayload
    >({
      query: (data) => ({
        url: urlWithLocale("/api/v1/contracts/checklists"),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contracts", "Checklists"],
    }),

    getContractPdfUrl: builder.query<
      { url: string },
      { contractId: string; type: "draft" | "out" | "final" }
    >({
      query: ({ contractId, type }) =>
        urlWithLocale(`/api/v1/contracts/${contractId}/pdf?type=${type}`),
    }),
  }),
});

export const {
  useGetContractByBookingIdQuery,
  useLazyGetContractByBookingIdQuery,
  useCreateContractMutation,
  useUpdateContractStatusMutation,
  useCreateChecklistMutation,
  useGetContractPdfUrlQuery,
  useLazyGetContractPdfUrlQuery,
} = contractsApiSlice;
