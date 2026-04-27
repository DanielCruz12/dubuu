"use client";

import type { RootState } from "@/redux/store";
import type { BlogPostsListResponse, IBlogPost } from "@/types/blog";
import { normalizeBlogPost } from "@/utils/normalize-blog-post";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";

function normalizeListResponse(raw: unknown): BlogPostsListResponse {
  if (Array.isArray(raw)) {
    const data = raw.map(normalizeBlogPost);
    return {
      data,
      pagination: {
        total: data.length,
        totalPages: 1,
        page: 1,
        limit: data.length,
      },
    };
  }

  const obj = raw as Record<string, unknown>;
  const dataRaw = obj.data ?? obj.posts ?? obj.results ?? obj.items;
  const posts = Array.isArray(dataRaw)
    ? dataRaw.map(normalizeBlogPost)
    : [];
  const pagination = obj.pagination as
    | BlogPostsListResponse["pagination"]
    | undefined;

  return {
    data: posts,
    pagination: pagination ?? {
      total: posts.length,
      totalPages: 1,
      page: 1,
      limit: posts.length,
    },
  };
}

export const blogsApiSlice = createApi({
  reducerPath: "blogs",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["BlogPosts"],
  endpoints: (builder) => ({
    getBlogPosts: builder.query<
      BlogPostsListResponse,
      Record<string, string | number | boolean | undefined>
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        const qs = searchParams.toString();
        return urlWithLocale(
          qs ? `/api/v1/blog/posts?${qs}` : "/api/v1/blog/posts",
        );
      },
      transformResponse: normalizeListResponse,
      providesTags: (result) =>
        result?.data
          ? [
              { type: "BlogPosts" as const, id: "LIST" },
              ...result.data.map(({ id }) => ({
                type: "BlogPosts" as const,
                id,
              })),
            ]
          : [{ type: "BlogPosts" as const, id: "LIST" }],
    }),

    getBlogPost: builder.query<IBlogPost, string>({
      query: (id) => urlWithLocale(`/api/v1/blog/posts/${encodeURIComponent(id)}`),
      // Toda la desanidación vive en normalizeBlogPost → unwrapBlogPayload
      transformResponse: (raw: unknown) => normalizeBlogPost(raw),
      providesTags: (result, error, id) => [{ type: "BlogPosts", id }],
    }),
  }),
});

export const { useGetBlogPostsQuery, useGetBlogPostQuery } = blogsApiSlice;
