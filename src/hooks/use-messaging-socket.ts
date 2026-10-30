/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useSocket } from "@/contexts/socket-context";
import { useAppDispatch } from "@/redux/store";
import { messagesApiSlice } from "@/redux/slices/messaging/messaging-slice";
import type {
  MessageDeliveredPayload,
  MessageNewPayload,
  MessageReactionPayload,
  MessageReadPayload,
} from "@/types/messaging";

/**
 * Los tipos de `socket.io-client` están rotos en este proyecto (`Socket.on/off`
 * no resuelven; ver errores preexistentes en `socket-context.tsx`), así que se
 * usa esta interfaz mínima en lugar de propagar el problema. En runtime el
 * socket real sí implementa `on`/`off`/`emit`.
 * Se exporta para otros suscriptores (notificaciones globales).
 */
export interface SocketEmitterLike {
  on(event: string, listener: (...args: any[]) => void): unknown;
  off(event: string, listener: (...args: any[]) => void): unknown;
}

/**
 * Conecta los eventos Socket.IO del chat con el caché de RTK Query:
 * al llegar `message:new|delivered|read|reaction` se invalida la lista de
 * chats, el contador de no leídos y los mensajes del chat afectado.
 * Montar una vez por vista de mensajes (y global para el badge en Fase 4).
 */
export function useMessagingSocket() {
  const { socket } = useSocket();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) return;
    const emitter = socket as unknown as SocketEmitterLike;

    const invalidateChat = (bookingId: string) => {
      dispatch(
        messagesApiSlice.util.invalidateTags([
          { type: "Chats", id: "LIST" },
          { type: "UnreadCount", id: "TOTAL" },
          { type: "ChatMessages", id: bookingId },
        ])
      );
    };

    const onNew = (payload: MessageNewPayload) => {
      if (payload?.message?.booking_id)
        invalidateChat(payload.message.booking_id);
    };
    const onDelivered = (payload: MessageDeliveredPayload) => {
      if (payload?.bookingId) invalidateChat(payload.bookingId);
    };
    const onRead = (payload: MessageReadPayload) => {
      if (payload?.bookingId) invalidateChat(payload.bookingId);
    };
    const onReaction = (payload: MessageReactionPayload) => {
      if (payload?.bookingId) invalidateChat(payload.bookingId);
    };

    emitter.on("message:new", onNew);
    emitter.on("message:delivered", onDelivered);
    emitter.on("message:read", onRead);
    emitter.on("message:reaction", onReaction);

    return () => {
      emitter.off("message:new", onNew);
      emitter.off("message:delivered", onDelivered);
      emitter.off("message:read", onRead);
      emitter.off("message:reaction", onReaction);
    };
  }, [socket, dispatch]);
}
