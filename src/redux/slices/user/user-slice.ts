import { RootState } from "@/redux/store";
import { IUser } from "@/types/user";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlWithLocale } from "@/redux/url-with-locale";

export const usersApiSlice = createApi({
  reducerPath: "users",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backend",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<
      {
        data: IUser[];
        pagination: {
          total: number;
          totalPages: number;
          page: number;
          limit: number;
        };
      },
      Record<string, string | number | boolean | undefined>
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        return `/api/v1/users?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Users", id: "LIST" },
              ...result.data.map(({ id }) => ({
                type: "Users" as const,
                id,
              })),
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUser: builder.query<IUser, string>({
      query: (id) => urlWithLocale(`/api/v1/users/${id}`),
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    createUser: builder.mutation<IUser, Partial<IUser>>({
      query: (data) => ({
        url: urlWithLocale("/api/v1/users"),
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    updateUser: builder.mutation<IUser, { id: string; data: Partial<IUser> }>({
      query: ({ id, data }) => ({
        url: urlWithLocale(`/api/v1/users/${id}`),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: urlWithLocale(`/api/v1/users/${id}`),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;
