"use client";
import { IProduct } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApiSlice = createApi({
  reducerPath: "products",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_URL || "localhost:3000",
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => {
    return {
      getProducts: builder.query<IProduct[], void>({
        query: () => `/api/v1/products`,
        providesTags: (result) =>
          result
            ? [
                { type: "Products", id: "LIST" },
                ...result.map(({ id }) => ({ type: "Products" as const, id })),
              ]
            : [{ type: "Products", id: "LIST" }],
      }),
      createProduct: builder.mutation<IProduct, Omit<IProduct, "id">>({
        query: (post) => ({
          url: "api/v1/products",
          method: "POST",
          body: post,
        }),
        invalidatesTags: [{ type: "Products", id: "LIST" } as const],
      }),
    };
  },
});

export const { useGetProductsQuery, useCreateProductMutation } =
  productsApiSlice;
