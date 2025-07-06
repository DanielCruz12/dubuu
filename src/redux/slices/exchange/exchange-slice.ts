import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const exchangesApiSlice = createApi({
  reducerPath: "exchange",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend/api/v1", // apunta a la raíz donde está el router apiRoutes
  }),
  tagTypes: ["Exchange"],
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getExchanges: builder.query<any, string>({
      query: (currency) => `/exchange/${currency}`, // llama a /exchange/:base
      keepUnusedDataFor: 43200, // 12 horas
      providesTags: (result) =>
        result
          ? [
              { type: "Exchange", id: "LIST" },
              ...Object.keys(result?.conversion_rates || {}).map((id) => ({
                type: "Exchange" as const,
                id,
              })),
            ]
          : [{ type: "Exchange", id: "LIST" }],
    }),
  }),
});

export const { useGetExchangesQuery } = exchangesApiSlice;
