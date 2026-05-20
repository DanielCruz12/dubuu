"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  IRentalApplication,
  UpdateRentalApplicationInput,
} from "@/types/rental-application";
import { urlWithLocale } from "@/redux/url-with-locale";

export const rentalApplicationsApiSlice = createApi({
  reducerPath: "rentalApplicationsApi",
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
  tagTypes: ["RentalApplications"],
  endpoints: (builder) => ({
    getUserApplications: builder.query<IRentalApplication[], string>({
      query: (userId) =>
        urlWithLocale(`/api/v1/rental-applications/user/${userId}`),
      providesTags: (result) =>
        result
          ? [
              { type: "RentalApplications", id: "USER_LIST" },
              ...result.map(({ id }) => ({
                type: "RentalApplications" as const,
                id,
              })),
            ]
          : [{ type: "RentalApplications", id: "USER_LIST" }],
    }),

    getProductApplications: builder.query<IRentalApplication[], string>({
      query: (productId) =>
        urlWithLocale(`/api/v1/rental-applications/product/${productId}`),
      providesTags: (result) =>
        result
          ? [
              { type: "RentalApplications", id: "PRODUCT_LIST" },
              ...result.map(({ id }) => ({
                type: "RentalApplications" as const,
                id,
              })),
            ]
          : [{ type: "RentalApplications", id: "PRODUCT_LIST" }],
    }),

    getApplicationById: builder.query<IRentalApplication, string>({
      query: (id) => urlWithLocale(`/api/v1/rental-applications/${id}`),
      providesTags: (result, error, id) => [
        { type: "RentalApplications", id },
      ],
    }),

    createRentalApplication: builder.mutation<
      IRentalApplication,
      FormData
    >({
      query: (formData) => ({
        url: urlWithLocale("/api/v1/rental-applications/"),
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "RentalApplications", id: "USER_LIST" }],
    }),

    updateApplication: builder.mutation<
      IRentalApplication,
      { id: string; data: UpdateRentalApplicationInput }
    >({
      query: ({ id, data }) => ({
        url: urlWithLocale(`/api/v1/rental-applications/${id}`),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RentalApplications", id },
      ],
    }),

    deleteApplication: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: urlWithLocale(`/api/v1/rental-applications/${id}`),
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "RentalApplications", id },
        { type: "RentalApplications", id: "USER_LIST" },
      ],
    }),
  }),
});

export const {
  useGetUserApplicationsQuery,
  useGetProductApplicationsQuery,
  useGetApplicationByIdQuery,
  useCreateRentalApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
} = rentalApplicationsApiSlice;
