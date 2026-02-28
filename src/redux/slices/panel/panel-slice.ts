"use client";

import type { RootState } from "@/redux/store";
import type { PanelSummary } from "@/types/panel";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const panelApiSlice = createApi({
  reducerPath: "panelApi",
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
  tagTypes: ["PanelSummary"],
  endpoints: (builder) => ({
    getPanelSummary: builder.query<PanelSummary, string>({
      query: (userId) => `/api/v1/panel/summary/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "PanelSummary", id: userId },
      ],
    }),
  }),
});

export const { useGetPanelSummaryQuery } = panelApiSlice;
