import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  PayoutSummary,
  PayoutFilters,
  HostOption,
  HostsTableParams,
  HostsTableResponse,
  HostPaymentDetail,
  HostBankDetails,
  HostPaymentHistoryParams,
  PayoutHistoryResponse,
  RegisterPaymentInput,
} from "@/types/payout";

function paramsToQuery(filters: PayoutFilters) {
  const searchParams = new URLSearchParams();
  if (filters.dateFrom) searchParams.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) searchParams.append("dateTo", filters.dateTo);
  if (filters.hostId) searchParams.append("hostId", filters.hostId);
  if (filters.page) searchParams.append("page", String(filters.page));
  if (filters.pageSize) searchParams.append("pageSize", String(filters.pageSize));
  return searchParams.toString();
}

function hostsTableParamsToQuery(params: HostsTableParams) {
  const searchParams = new URLSearchParams();
  if (params.dateFrom) searchParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.append("dateTo", params.dateTo);
  if (params.hostId) searchParams.append("hostId", params.hostId);
  if (params.search) searchParams.append("search", params.search);
  if (params.status) searchParams.append("status", params.status);
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.pageSize) searchParams.append("pageSize", String(params.pageSize));
  return searchParams.toString();
}

function hostHistoryParamsToQuery(params: HostPaymentHistoryParams) {
  const searchParams = new URLSearchParams();
  if (params.dateFrom) searchParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.append("dateTo", params.dateTo);
  if (params.search) searchParams.append("search", params.search);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.pageSize) searchParams.append("pageSize", String(params.pageSize));
  return searchParams.toString();
}

export const payoutApiSlice = createApi({
  reducerPath: "payout",
  baseQuery: fetchBaseQuery({ baseUrl: "/backend" }),
  tagTypes: ["PayoutSummary", "HostPayment", "HostPaymentHistory"],
  endpoints: (builder) => ({
    getPayoutSummary: builder.query<PayoutSummary, PayoutFilters>({
      query: (filters) => `/api/v1/admin/payouts/summary?${paramsToQuery(filters)}`,
      providesTags: ["PayoutSummary"],
    }),

    getHosts: builder.query<HostOption[], void>({
      query: () => "/api/v1/admin/payouts/hosts",
    }),

    getHostsTable: builder.query<HostsTableResponse, HostsTableParams>({
      query: (params) =>
        `/api/v1/admin/payouts/hosts-table?${hostsTableParamsToQuery(params)}`,
    }),

    getHostPaymentDetail: builder.query<HostPaymentDetail, string>({
      query: (hostId) => `/api/v1/admin/payouts/hosts/${hostId}`,
      providesTags: (result) =>
        result ? [{ type: "HostPayment", id: result.user.id }] : [],
    }),

    getHostPaymentHistory: builder.query<
      PayoutHistoryResponse,
      HostPaymentHistoryParams
    >({
      query: (params) =>
        `/api/v1/admin/payouts/hosts/${params.hostId}/history?${hostHistoryParamsToQuery(params)}`,
      providesTags: ["HostPaymentHistory"],
    }),

    getHostBankDetails: builder.query<HostBankDetails, string>({
      query: (hostId) => `/api/v1/admin/payouts/hosts/${hostId}/bank-details`,
    }),

    registerPayment: builder.mutation<{ id: string }, RegisterPaymentInput>({
      query: (body) => ({
        url: "/api/v1/admin/payouts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayoutSummary", "HostPayment", "HostPaymentHistory"],
    }),
  }),
});

export const {
  useGetPayoutSummaryQuery,
  useGetHostsQuery,
  useGetHostsTableQuery,
  useGetHostPaymentDetailQuery,
  useGetHostPaymentHistoryQuery,
  useGetHostBankDetailsQuery,
  useRegisterPaymentMutation,
} = payoutApiSlice;
