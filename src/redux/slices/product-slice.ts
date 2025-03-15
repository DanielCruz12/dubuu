"use client";
import { IProduct } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApiSlice = createApi({
  reducerPath: "products",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_URL || "localhost:3000",
   
  }),
  endpoints: (builder) => {
    return {
      getProducts: builder.query<IProduct[], void>({
        query: () => `/api/v1/products`,
      }),
      createProduct: builder.mutation<IProduct, Omit<IProduct, "id">>({
        query: (post) => ({
          url: "api/v1/products",
          method: "POST",
          body: post,
        }),
      }),
    };
  },
});

export const { useGetProductsQuery, useCreateProductMutation } =
  productsApiSlice;
