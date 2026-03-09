"use client";
import type { IProductCategory } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";

// Tipos para las mutaciones
interface CreateProductCategoryRequest {
  name: string;
  description: string;
  product_type_id: string;
}

export const productCategoriesApiSlice = createApi({
  reducerPath: "productCategories",
  baseQuery: fetchBaseQuery({ baseUrl: "/backend" }),
  tagTypes: ["ProductCategories"],
  endpoints: (builder) => {
    return {
      // 🔍 Obtener todas las categorías de producto
      getProductCategories: builder.query<IProductCategory[], void>({
        query: () => urlWithLocale("/api/v1/product-category/"),
        providesTags: (result) =>
          result
            ? [
                { type: "ProductCategories", id: "LIST" },
                ...result.map(({ id }) => ({
                  type: "ProductCategories" as const,
                  id,
                })),
              ]
            : [{ type: "ProductCategories", id: "LIST" }],
      }),

      // 🔍 Obtener una categoría por ID
      getProductCategoryById: builder.query<IProductCategory, string>({
        query: (id) => urlWithLocale(`/api/v1/product-category/${id}`),
        providesTags: (result, error, id) => [
          { type: "ProductCategories", id },
        ],
      }),

      // ➕ Crear categoría de producto
      createProductCategory: builder.mutation<
        IProductCategory,
        CreateProductCategoryRequest
      >({
        query: (newProductCategory) => ({
          url: urlWithLocale("/api/v1/product-category/"),
          method: "POST",
          body: newProductCategory,
        }),
        invalidatesTags: [{ type: "ProductCategories", id: "LIST" }],
      }),

      // ❌ Eliminar categoría de producto
      deleteProductCategory: builder.mutation<IProductCategory, string>({
        query: (id) => ({
          url: urlWithLocale(`/api/v1/product-category/${id}`),
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "ProductCategories", id },
          { type: "ProductCategories", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetProductCategoriesQuery,
  useGetProductCategoryByIdQuery,
  useCreateProductCategoryMutation,
  useDeleteProductCategoryMutation,
} = productCategoriesApiSlice;
