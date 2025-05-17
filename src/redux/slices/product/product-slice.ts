"use client";
import { IProduct } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApiSlice = createApi({
  reducerPath: "products",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
  }),
  tagTypes: ["Products", "Reviews"],
  // Configuración global para evitar refetch automático
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => {
    return {
      getProducts: builder.query<
        {
          data: IProduct[];
          pagination: {
            hasMore: boolean;
            nextCursor: string | null;
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
        invalidatesTags: [
          { type: "Reviews", id: "LIST" } as const,
          { type: "Products", id: "LIST" } as const,
        ],
      }),

      getProduct: builder.query<IProduct, string>({
        query: (id) => `/api/v1/products/${id}`,
        keepUnusedDataFor: 0,
        providesTags: (result, error, id) => [{ type: "Products", id }],
      }),

      getProductsByUserId: builder.query<IProduct[], string>({
        query: (userId) => `/api/v1/products/user/${userId}`,
        providesTags: (result, error, id) => [{ type: "Products", id }],
      }),

      getProductsByUserIdUsersimplified: builder.query<IProduct[], string>({
        query: (userId) => `/api/v1/products/usersimplified/${userId}`,
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
        invalidatesTags: [
          { type: "Reviews", id: "LIST" } as const,
          { type: "Products", id: "LIST" } as const,
        ],
      }),

      deleteProduct: builder.mutation<{ success: boolean }, string>({
        query: (id) => ({
          url: `/api/v1/products/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: [
          { type: "Reviews", id: "LIST" } as const,
          { type: "Products", id: "LIST" } as const,
        ],
      }),
    };
  },
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductsByUserIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductsByUserIdUsersimplifiedQuery,
} = productsApiSlice;
