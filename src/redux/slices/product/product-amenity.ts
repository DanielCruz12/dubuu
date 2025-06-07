"use client";
import type { IProductAmenity } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Tipos para las mutaciones
interface CreateProductAmenityRequest {
  name: string;
  description: string;
  category_id: string;
}

export const productAmenitiesApiSlice = createApi({
  reducerPath: "productAmenities",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
  }),
  tagTypes: ["ProductAmenities"],
  endpoints: (builder) => {
    return {
      // 🔍 Obtener todos los amenities de producto
      getProductAmenities: builder.query<IProductAmenity[], void>({
        query: () => `/api/v1/product-amenities/`,
        providesTags: (result) =>
          result
            ? [
                { type: "ProductAmenities", id: "LIST" },
                ...result.map(({ id }) => ({
                  type: "ProductAmenities" as const,
                  id,
                })),
              ]
            : [{ type: "ProductAmenities", id: "LIST" }],
      }),

      // 🔍 Obtener un amenity por ID
      getProductAmenityById: builder.query<IProductAmenity, string>({
        query: (id) => `/api/v1/product-amenities/${id}`,
        providesTags: (result, error, id) => [{ type: "ProductAmenities", id }],
      }),

      // ➕ Crear amenity de producto
      createProductAmenity: builder.mutation<
        IProductAmenity,
        CreateProductAmenityRequest
      >({
        query: (newProductAmenity) => ({
          url: `/api/v1/product-amenities/`,
          method: "POST",
          body: newProductAmenity,
        }),
        invalidatesTags: [{ type: "ProductAmenities", id: "LIST" }],
      }),

      // ❌ Eliminar amenity de producto
      deleteProductAmenity: builder.mutation<IProductAmenity, string>({
        query: (id) => ({
          url: `/api/v1/product-amenities/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "ProductAmenities", id },
          { type: "ProductAmenities", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetProductAmenitiesQuery,
  useGetProductAmenityByIdQuery,
  useCreateProductAmenityMutation,
  useDeleteProductAmenityMutation,
} = productAmenitiesApiSlice;
