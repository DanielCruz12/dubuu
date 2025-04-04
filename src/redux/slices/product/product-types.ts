"use client";
import type { IProductTypes } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productTypesApiSlice = createApi({
  reducerPath: "productTypes",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
  }),
  tagTypes: ["ProductTypes"],
  endpoints: (builder) => {
    return {
      getProductTypes: builder.query<IProductTypes[], void>({
        query: () => `/api/v1/product-types/`,
        providesTags: (result) =>
          result
            ? [
                { type: "ProductTypes", id: "LIST" },
                ...result.map(({ id }) => ({
                  type: "ProductTypes" as const,
                  id,
                })),
              ]
            : [{ type: "ProductTypes", id: "LIST" }],
      }),
    };
  },
});

export const { useGetProductTypesQuery } = productTypesApiSlice;
