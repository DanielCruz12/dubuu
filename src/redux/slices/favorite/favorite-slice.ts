"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";

// Define the type for a favorite item
interface FavoriteItem {
  id: string;
  productId: string;
}

export const favoritesApiSlice = createApi({
  reducerPath: "favorites",
  baseQuery: fetchBaseQuery({ baseUrl: "/backend" }),
  tagTypes: ["Favorites"],
  endpoints: (builder) => {
    return {
      saveProduct: builder.mutation<
        { success: boolean },
        { productId: string; userId: string }
      >({
        query: ({ productId, userId }) => ({
          url: urlWithLocale("/api/v1/favorite"),
          method: "POST",
          body: { productId, userId },
        }),
        invalidatesTags: [{ type: "Favorites", id: "LIST" }],
      }),

      unsaveProduct: builder.mutation<
        { success: boolean },
        { productId: string; userId: string }
      >({
        query: ({ productId, userId }) => ({
          url: urlWithLocale("/api/v1/favorite"),
          method: "DELETE",
          body: { productId, userId },
        }),
        invalidatesTags: [{ type: "Favorites", id: "LIST" }],
      }),

      getUserFavorites: builder.query<FavoriteItem[], { userId: string }>({
        query: ({ userId }) => ({
          url: urlWithLocale(`/api/v1/favorite/user/${userId}`),
          method: "GET",
        }),
        providesTags: [{ type: "Favorites", id: "LIST" }],
      }),
    };
  },
});

export const {
  useGetUserFavoritesQuery,
  useSaveProductMutation,
  useUnsaveProductMutation,
} = favoritesApiSlice;
