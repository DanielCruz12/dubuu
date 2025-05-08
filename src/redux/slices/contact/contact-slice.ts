"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ContactMessage } from "@/types/contact";

export const contactsApiSlice = createApi({
  reducerPath: "contacts",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
    prepareHeaders: async (headers, { getState }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (getState() as any).auth?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Contacts"],
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation<
      { success: boolean; message: string },
      ContactMessage
    >({
      query: (data) => ({
        url: "/api/v1/contact",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Contacts", id: "LIST" }],
    }),
  }),
});

export const { useSendContactMessageMutation } = contactsApiSlice;
