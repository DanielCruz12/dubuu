"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";
import type { AiAnalyzeResponse, AiEnhanceResponse } from "@/components/ai-create/ai-types";
import type { IProduct } from "@/types/product";

export interface AiLimitStatus {
  used: number;
  limit: number;
  remaining: number;
  canCreate: boolean;
}

export const aiProductApiSlice = createApi({
  reducerPath: "aiProducts",
  baseQuery: fetchBaseQuery({ baseUrl: "/backend" }),
  tagTypes: ["AiLimit", "Products"],
  endpoints: (builder) => ({
    analyzeVehicle: builder.mutation<AiAnalyzeResponse, FormData>({
      query: (formData) => ({
        url: urlWithLocale("/api/v1/ai-products/vehicles/analyze"),
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "AiLimit" as const, id: "STATUS" }],
    }),

    enhanceVehicleImage: builder.mutation<AiEnhanceResponse, FormData>({
      query: (formData) => ({
        url: urlWithLocale("/api/v1/ai-products/vehicles/enhance-image"),
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "AiLimit" as const, id: "STATUS" }],
    }),

    publishVehicle: builder.mutation<IProduct, FormData>({
      query: (formData) => ({
        url: urlWithLocale("/api/v1/ai-products/vehicles/publish"),
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        { type: "AiLimit" as const, id: "STATUS" },
        { type: "Products" as const, id: "LIST" },
        { type: "Products" as const, id: "USER_PRODUCTS" },
      ],
    }),

    getAiLimitStatus: builder.query<AiLimitStatus, void>({
      query: () => urlWithLocale("/api/v1/ai-products/vehicles/limit"),
      providesTags: [{ type: "AiLimit", id: "STATUS" }],
    }),
  }),
});

export const {
  useAnalyzeVehicleMutation,
  useEnhanceVehicleImageMutation,
  usePublishVehicleMutation,
  useGetAiLimitStatusQuery,
} = aiProductApiSlice;
