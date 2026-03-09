"use client";
import type { IProductAudience } from "@/types/product";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";

// Tipos para las mutaciones
interface CreateProductAudienceRequest {
  name: string;
  description: string;
}

export const productAudiencesApiSlice = createApi({
  reducerPath: "productAudiences",
  baseQuery: fetchBaseQuery({ baseUrl: "/backend" }),
  tagTypes: ["ProductAudiences"],
  endpoints: (builder) => {
    return {
      // 🔍 Obtener todas las audiencias objetivo
      getProductAudiences: builder.query<IProductAudience[], void>({
        query: () => urlWithLocale("/api/v1/product-audience/"),
        providesTags: (result) =>
          result
            ? [
                { type: "ProductAudiences", id: "LIST" },
                ...result.map(({ id }) => ({
                  type: "ProductAudiences" as const,
                  id,
                })),
              ]
            : [{ type: "ProductAudiences", id: "LIST" }],
      }),

      // 🔍 Obtener una audiencia por ID
      getProductAudienceById: builder.query<IProductAudience, string>({
        query: (id) => urlWithLocale(`/api/v1/product-audience/${id}`),
        providesTags: (result, error, id) => [{ type: "ProductAudiences", id }],
      }),

      // ➕ Crear audiencia objetivo
      createProductAudience: builder.mutation<
        IProductAudience,
        CreateProductAudienceRequest
      >({
        query: (newProductAudience) => ({
          url: urlWithLocale("/api/v1/product-audience/"),
          method: "POST",
          body: newProductAudience,
        }),
        invalidatesTags: [{ type: "ProductAudiences", id: "LIST" }],
      }),

      // ❌ Eliminar audiencia objetivo
      deleteProductAudience: builder.mutation<IProductAudience, string>({
        query: (id) => ({
          url: urlWithLocale(`/api/v1/product-audience/${id}`),
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "ProductAudiences", id },
          { type: "ProductAudiences", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetProductAudiencesQuery,
  useGetProductAudienceByIdQuery,
  useCreateProductAudienceMutation,
  useDeleteProductAudienceMutation,
} = productAudiencesApiSlice;
