"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ChatListItem,
  ChatMessage,
  MessageReactionGroup,
  MessagesPage,
} from "@/types/messaging";
import { urlWithLocale } from "@/redux/url-with-locale";

export interface SendMessageInput {
  kind?: "text" | "location";
  body?: string;
  location_lat?: number;
  location_lng?: number;
  location_label?: string;
}

export const messagesApiSlice = createApi({
  reducerPath: "messagesApi",
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
  tagTypes: ["Chats", "ChatMessages", "UnreadCount"],
  endpoints: (builder) => ({
    // 🔹 Chats del usuario (como viajero y como host)
    getChats: builder.query<ChatListItem[], void>({
      query: () => urlWithLocale("/api/v1/messages/chats"),
      providesTags: (result) =>
        result
          ? [
              { type: "Chats", id: "LIST" },
              ...result.map(({ bookingId }) => ({
                type: "Chats" as const,
                id: bookingId,
              })),
            ]
          : [{ type: "Chats", id: "LIST" }],
    }),

    // 🔹 Total de no leídos (badge "Mensajes")
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => "/api/v1/messages/unread-count",
      providesTags: [{ type: "UnreadCount", id: "TOTAL" }],
    }),

    // 🔹 Mensajes de un chat (paginado hacia atrás con `before`)
    getMessages: builder.query<
      MessagesPage,
      { bookingId: string; before?: string; limit?: number }
    >({
      query: ({ bookingId, before, limit }) => {
        const search = new URLSearchParams();
        if (before) search.set("before", before);
        if (limit) search.set("limit", String(limit));
        const params = search.size > 0 ? `?${search.toString()}` : "";
        return `/api/v1/messages/bookings/${bookingId}${params}`;
      },
      providesTags: (result, error, { bookingId }) => [
        { type: "ChatMessages", id: bookingId },
      ],
    }),

    // 🔹 Enviar mensaje (texto o ubicación)
    sendMessage: builder.mutation<
      ChatMessage,
      { bookingId: string; input: SendMessageInput }
    >({
      query: ({ bookingId, input }) => ({
        url: `/api/v1/messages/bookings/${bookingId}`,
        method: "POST",
        body: input,
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: "Chats", id: "LIST" },
        { type: "ChatMessages", id: bookingId },
      ],
    }),

    // 🔹 Voz a texto (no invalida nada: devuelve texto para el input)
    transcribeVoice: builder.mutation<
      { text: string },
      { bookingId: string; audio: Blob }
    >({
      query: ({ bookingId, audio }) => {
        const form = new FormData();
        const filename = audio.type.includes("mp4")
          ? "voice.m4a"
          : audio.type.includes("wav")
            ? "voice.wav"
            : "voice.webm";
        form.append("audio", audio, filename);
        return {
          url: urlWithLocale(
            `/api/v1/messages/bookings/${bookingId}/transcribe`
          ),
          method: "POST",
          body: form,
        };
      },
    }),

    // 🔹 Marcar mensajes del chat como leídos
    markRead: builder.mutation<{ read: number }, string>({
      query: (bookingId) => ({
        url: `/api/v1/messages/bookings/${bookingId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, bookingId) => [
        { type: "Chats", id: "LIST" },
        { type: "UnreadCount", id: "TOTAL" },
        { type: "ChatMessages", id: bookingId },
      ],
    }),

    // 🔹 Reaccionar (crea o cambia mi reacción)
    upsertReaction: builder.mutation<
      { reactions: MessageReactionGroup[] },
      { messageId: string; bookingId: string; emoji: string }
    >({
      query: ({ messageId, emoji }) => ({
        url: `/api/v1/messages/${messageId}/reactions`,
        method: "POST",
        body: { emoji },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: "ChatMessages", id: bookingId },
      ],
    }),

    // 🔹 Quitar mi reacción
    removeReaction: builder.mutation<
      { reactions: MessageReactionGroup[] },
      { messageId: string; bookingId: string }
    >({
      query: ({ messageId }) => ({
        url: `/api/v1/messages/${messageId}/reactions`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: "ChatMessages", id: bookingId },
      ],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetUnreadCountQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
  useTranscribeVoiceMutation,
  useMarkReadMutation,
  useUpsertReactionMutation,
  useRemoveReactionMutation,
} = messagesApiSlice;
