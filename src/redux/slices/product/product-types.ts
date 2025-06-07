"use client";
import type { IProductTypes } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Tipos para las mutaciones
interface CreateProductTypeRequest {
  name: string;
  description: string;
}

interface UpdateProductTypeRequest {
  id: string;
  data: {
    name: string;
    description: string;
  };
}

export const productTypesApiSlice = createApi({
  reducerPath: "productTypes",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
  }),
  tagTypes: ["ProductTypes"],
  endpoints: (builder) => {
    return {
      // 🔍 Obtener todos los tipos de producto
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

      // 🔍 Obtener un tipo por ID
      getProductTypeById: builder.query<IProductTypes, string>({
        query: (id) => `/api/v1/product-types/${id}`,
        providesTags: (result, error, id) => [{ type: "ProductTypes", id }],
      }),

      // ➕ Crear tipo de producto
      createProductType: builder.mutation<
        IProductTypes,
        CreateProductTypeRequest
      >({
        query: (newProductType) => ({
          url: `/api/v1/product-types/`,
          method: "POST",
          body: newProductType,
        }),
        invalidatesTags: [{ type: "ProductTypes", id: "LIST" }],
      }),

      // 🔄 Actualizar tipo de producto
      updateProductType: builder.mutation<
        IProductTypes,
        UpdateProductTypeRequest
      >({
        query: ({ id, data }) => ({
          url: `/api/v1/product-types/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "ProductTypes", id },
          { type: "ProductTypes", id: "LIST" },
        ],
      }),

      // ❌ Eliminar tipo de producto
      deleteProductType: builder.mutation<IProductTypes, string>({
        query: (id) => ({
          url: `/api/v1/product-types/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "ProductTypes", id },
          { type: "ProductTypes", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetProductTypesQuery,
  useGetProductTypeByIdQuery,
  useCreateProductTypeMutation,
  useUpdateProductTypeMutation,
  useDeleteProductTypeMutation,
} = productTypesApiSlice;
