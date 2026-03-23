"use client";
import type { IProduct, PatchTourProductBody, UpdateProductResponse } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";

export const productsApiSlice = createApi({
  reducerPath: "products",
  baseQuery: fetchBaseQuery({ baseUrl: "/backend" }),
  tagTypes: ["Products", "Reviews"],
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
        Record<string, string | number | boolean | undefined> & {
          is_approved?: boolean;
          is_active?: boolean;
          min_rating?: number;
        }
      >({
        query: (params) => {
          const searchParams = new URLSearchParams();

          const isApprovedParam =
            params.is_approved !== undefined ? params.is_approved : true;
          searchParams.append("is_approved", String(isApprovedParam));

          const isActiveParam =
            params.is_active !== undefined ? params.is_active : true;
          searchParams.append("is_active", String(isActiveParam));

          Object.entries(params).forEach(([key, value]) => {
            // ¡IMPORTANTE! Saltamos is_approved y is_active porque ya los agregamos arriba
            if (key === "is_approved" || key === "is_active") return;
            if (value !== undefined && value !== null && value !== "") {
              // Para arrays, convertir a string separado por comas
              if (Array.isArray(value)) {
                if (value.length > 0) {
                  searchParams.append(key, value.join(","));
                }
              } else {
                searchParams.append(key, String(value));
              }
            }
          });

          return urlWithLocale(`/api/v1/products?${searchParams.toString()}`);
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

      searchProducts: builder.query<
        {
          data: IProduct[];
          pagination: {
            hasMore: boolean;
            nextCursor: string | null;
            limit: number;
          };
        },
        {
          search: string;
          product_type?: string;
          country?: string;
          min_price?: number;
          max_price?: number;
          is_approved?: boolean;
          min_rating?: number;
          is_active?: boolean;
          categories?: string[];
          durations?: string[];
          limit?: number;
          cursor?: string;
        }
      >({
        query: (params) => {
          const searchParams = new URLSearchParams();

          // Parámetros de búsqueda
          if (params.search && params.search.length >= 3) {
            searchParams.append("search", params.search);
          }

          if (params.product_type) {
            searchParams.append("product_type", params.product_type);
          }

          if (params.country) {
            searchParams.append("country", params.country);
          }

          if (params.min_price !== undefined) {
            searchParams.append("min_price", String(params.min_price));
          }

          if (params.max_price !== undefined) {
            searchParams.append("max_price", String(params.max_price));
          }

          if (params.categories && params.categories.length > 0) {
            searchParams.append("categories", params.categories.join(","));
          }

          if (params.durations && params.durations.length > 0) {
            searchParams.append("durations", params.durations.join(","));
          }

          if (params.min_rating !== undefined) {
            searchParams.append("min_rating", String(params.min_rating));
          }

          if (params.limit) {
            searchParams.append("limit", String(params.limit));
          }

          if (params.cursor) {
            searchParams.append("cursor", params.cursor);
          }

          if (params.is_approved !== undefined) {
            searchParams.append("is_approved", String(params.is_approved));
          }

          if (params.is_active !== undefined) {
            searchParams.append("is_active", String(params.is_active));
          }

          return urlWithLocale(`/api/v1/products?${searchParams.toString()}`);
        },
        providesTags: ["Products"],
      }),

      createProduct: builder.mutation<IProduct, FormData>({
        query: (post) => ({
          url: urlWithLocale("/api/v1/products"),
          method: "POST",
          body: post,
        }),
        invalidatesTags: [
          { type: "Reviews", id: "LIST" } as const,
          { type: "Products", id: "LIST" } as const,
        ],
      }),

      getProduct: builder.query<IProduct, string>({
        query: (id) => urlWithLocale(`/api/v1/products/${id}`),
        keepUnusedDataFor: 0,
        providesTags: (result, error, id) => [{ type: "Products", id }],
      }),

      getProductsByUserId: builder.query<IProduct[], string>({
        query: (userId) => urlWithLocale(`/api/v1/products/user/${userId}`),
        providesTags: (result) => [
          { type: "Products", id: "USER_PRODUCTS" },
          ...(result?.map(({ id }) => ({ type: "Products" as const, id })) ||
            []),
        ],
      }),

      getProductsByUserIdUsersimplified: builder.query<IProduct[], string>({
        query: (userId) =>
          urlWithLocale(`/api/v1/products/usersimplified/${userId}`),
        providesTags: (result, error, id) => [{ type: "Products", id }],
      }),

      updateProduct: builder.mutation<
        UpdateProductResponse,
        {
          id: string;
          data: PatchTourProductBody | FormData | Record<string, unknown>;
        }
      >({
        query: ({ id, data }) => ({
          url: urlWithLocale(`/api/v1/products/${id}`),
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "Reviews", id: "LIST" } as const,
          { type: "Products", id: "LIST" } as const,
          { type: "Products", id: "USER_PRODUCTS" } as const,
          { type: "Products", id } as const,
        ],
      }),

      deleteProduct: builder.mutation<{ success: boolean }, string>({
        query: (id) => ({
          url: urlWithLocale(`/api/v1/products/${id}`),
          method: "DELETE",
        }),
        invalidatesTags: [
          { type: "Reviews", id: "LIST" } as const,
          { type: "Products", id: "LIST" } as const,
          { type: "Products", id: "USER_PRODUCTS" } as const,
        ],
      }),
    };
  },
});

export const {
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductQuery,
  useGetProductsByUserIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductsByUserIdUsersimplifiedQuery,
} = productsApiSlice;
