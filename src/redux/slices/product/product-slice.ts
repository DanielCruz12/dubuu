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

      getProduct: builder.query<IProduct, string>({
        query: (id) => `/api/v1/products/${id}`,
        providesTags: (result, error, id) => [{ type: "Products", id }],
      }),

      updateProduct: builder.mutation<
        IProduct,
        { id: string; data: Partial<IProduct> }
      >({
        query: ({ id, data }) => ({
          url: `/api/v1/products/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "Products", id }],
      }),

      deleteProduct: builder.mutation<{ success: boolean }, string>({
        query: (id) => ({
          url: `/api/v1/products/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Products", id },
          { type: "Products", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
