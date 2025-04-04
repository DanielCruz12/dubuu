"use client";
import { IProduct } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApiSlice = createApi({
  reducerPath: "products",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => {
    return {
      getProducts: builder.query<
        {
          data: IProduct[];
          pagination: {
            total: number;
            totalPages: number;
            page: number;
            limit: number;
          };
        },
        Record<string, string | number | boolean | undefined>
      >({
        query: (params) => {
          const searchParams = new URLSearchParams();

          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });

          return `/api/v1/products?${searchParams.toString()}`;
        },
        providesTags: (result) =>
          result?.data
            ? [
                { type: "Products", id: "LIST" },
                ...result.data.map(({ id }) => ({
                  type: "Products" as const,
                  id,
                })),
              ]
            : [{ type: "Products", id: "LIST" }],
      }),

      createProduct: builder.mutation<IProduct, Partial<IProduct>>({
        query: (post) => ({
          url: "/api/v1/products",
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
