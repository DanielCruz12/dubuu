import { baseApi } from ".";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEvents: build.query({
      query: () => "/api/v1/events",
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }: { id: string }) => ({
                type: "Events" as const,
                id,
              })),
              { type: "Events", id: "LIST" },
            ]
          : [{ type: "Events", id: "LIST" }],
    }),

    getEventById: build.query({
      query: (id: string) => `/api/v1/events/${id}`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    deleteEvent: build.mutation({
      query: (id) => ({
        url: `/api/v1/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Events", id: "LIST" }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useDeleteEventMutation,
} = eventApi;
