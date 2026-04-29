"use client";

import type { RootState } from "@/redux/store";
import type { HostProfilePatchBody, HostPublicProfile } from "@/types/host-profile";
import { normalizeHostPublicProfile } from "@/utils/host-profile-normalize";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";

export const hostProfileApiSlice = createApi({
  reducerPath: "hostProfile",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
    prepareHeaders: (headers, { getState }) => {
      // Si ya hay token en Redux lo ponemos por defecto (pero también
      // aceptamos token por-request en la mutation).
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["HostProfile"],
  endpoints: (builder) => ({
    getHostPublicProfile: builder.query<HostPublicProfile, { userId: string }>({
      query: ({ userId }) =>
        urlWithLocale(`/api/v1/hosts/${encodeURIComponent(userId)}/profile`),
      transformResponse: (raw: unknown) => normalizeHostPublicProfile(raw),
      providesTags: (_result, _error, { userId }) => [
        { type: "HostProfile", id: userId },
        { type: "HostProfile", id: "LIST" },
      ],
    }),

    patchHostProfile: builder.mutation<
      HostPublicProfile,
      { token?: string; body: HostProfilePatchBody }
    >({
      query: ({ token, body }) => ({
        url: urlWithLocale("/api/v1/hosts/profile"),
        method: "PATCH",
        body,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }),
      transformResponse: (raw: unknown) => normalizeHostPublicProfile(raw),
      invalidatesTags: [{ type: "HostProfile", id: "LIST" }],
    }),
  }),
});

export const {
  useGetHostPublicProfileQuery,
  useLazyGetHostPublicProfileQuery,
  usePatchHostProfileMutation,
} = hostProfileApiSlice;

