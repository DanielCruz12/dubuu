"use client";
import type { Review } from "@/types/review";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const reviewsApiSlice = createApi({
  reducerPath: "reviews",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/backend",
  }),
  tagTypes: ["Reviews"],
  endpoints: (builder) => {
    return {
      getReviews: builder.query<Review[], string>({
        query: (productId) => `/api/v1/ratings/${productId}`,
        providesTags: (result) =>
          result
            ? [
                { type: "Reviews", id: "LIST" },
                ...result.map(({ id }) => ({ type: "Reviews" as const, id })),
              ]
            : [{ type: "Reviews", id: "LIST" }],
      }),
      createReview: builder.mutation<Review, Omit<Review, "id">>({
        query: (post) => ({
          url: "api/v1/ratings",
          method: "POST",
          body: post,
        }),
        invalidatesTags: [{ type: "Reviews", id: "LIST" } as const],
      }),
    };
  },
});

export const { useGetReviewsQuery, useCreateReviewMutation } = reviewsApiSlice;
