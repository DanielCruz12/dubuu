import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  PayoutSummary,
  PayoutFilters,
  PayoutBookingsResponse,
  PayoutHistoryResponse,
  HostOption,
  ProductOption,
} from "@/types/payout";

function paramsToQuery(filters: PayoutFilters) {
  const searchParams = new URLSearchParams();
  if (filters.dateFrom) searchParams.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) searchParams.append("dateTo", filters.dateTo);
  if (filters.hostId) searchParams.append("hostId", filters.hostId);
  if (filters.productId) searchParams.append("productId", filters.productId);
  if (filters.payoutStatus) searchParams.append("payoutStatus", filters.payoutStatus);
  if (filters.page) searchParams.append("page", String(filters.page));
  if (filters.pageSize) searchParams.append("pageSize", String(filters.pageSize));
  return searchParams.toString();
}

export const payoutApiSlice = createApi({
  reducerPath: "payout",
  baseQuery: fetchBaseQuery({ baseUrl: "/backend" }),
  tagTypes: ["PayoutSummary", "PayoutBookings", "PayoutHistory"],
  endpoints: (builder) => ({
    getPayoutSummary: builder.query<PayoutSummary, PayoutFilters>({
      query: (filters) => `/api/v1/admin/payouts/summary?${paramsToQuery(filters)}`,
      providesTags: ["PayoutSummary"],
    }),

    getPayoutBookings: builder.query<PayoutBookingsResponse, PayoutFilters>({
      query: (filters) => `/api/v1/admin/payouts/bookings?${paramsToQuery(filters)}`,
      providesTags: ["PayoutBookings"],
    }),

    markBookingAsPaid: builder.mutation<
      { bookingId: string; commission: string; hostEarnings: string },
      { bookingId: string; paymentMethod?: string; notes?: string; attachmentUrl?: string }
    >({
      query: (body) => ({
        url: "/api/v1/admin/payouts/mark-paid",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayoutSummary", "PayoutBookings", "PayoutHistory"],
    }),

    markBookingsAsPaid: builder.mutation<
      { bookingId: string; commission: string; hostEarnings: string }[],
      { bookingIds: string[]; paymentMethod?: string; notes?: string; attachmentUrl?: string }
    >({
      query: (body) => ({
        url: "/api/v1/admin/payouts/mark-paid-batch",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayoutSummary", "PayoutBookings", "PayoutHistory"],
    }),

    getPayoutHistory: builder.query<PayoutHistoryResponse, PayoutFilters>({
      query: (filters) => `/api/v1/admin/payouts/history?${paramsToQuery(filters)}`,
      providesTags: ["PayoutHistory"],
    }),

    getHosts: builder.query<HostOption[], void>({
      query: () => "/api/v1/admin/payouts/hosts",
    }),

    getProductsByHost: builder.query<ProductOption[], string>({
      query: (hostId) => `/api/v1/admin/payouts/hosts/${hostId}/products`,
    }),
  }),
});

export const {
  useGetPayoutSummaryQuery,
  useGetPayoutBookingsQuery,
  useMarkBookingAsPaidMutation,
  useMarkBookingsAsPaidMutation,
  useGetPayoutHistoryQuery,
  useGetHostsQuery,
  useGetProductsByHostQuery,
} = payoutApiSlice;
