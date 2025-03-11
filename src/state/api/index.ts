import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_URL,
  }),
  reducerPath: "api",
  tagTypes: ["Events", "Users", "Projects"],
  endpoints: () => ({}),
});
