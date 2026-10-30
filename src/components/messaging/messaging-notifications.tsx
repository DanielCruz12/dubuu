"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useSocket } from "@/contexts/socket-context";
import { useClerkToken } from "@/components/providers/auth-provider";
import { useLanguage } from "@/lib/i18n-context";
import { useGetChatsQuery } from "@/redux/slices/messaging/messaging-slice";
import {
  useMessagingSocket,
  type SocketEmitterLike,
} from "@/hooks/use-messaging-socket";
import { vibrateTap } from "@/lib/vibration";
import type { ChatMessage, MessageNewPayload } from "@/types/messaging";

/**
 * Notificaciones globales del chat (sin UI; montar una vez en providers):
 * - Mantiene chats/badge actualizados en toda la app (vía `useMessagingSocket`).
 * - Muestra un toast al recibir un mensaje de otro usuario, con acceso directo
 *   al chat. Si ya estás en Mensajes, la vista se actualiza sola y no hay toast.
 */
export function MessagingNotifications() {
  useMessagingSocket();

  const { socket } = useSocket();
  const { user } = useUser();
  const { hasRole } = useClerkToken();
  const { language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const { data: chats = [] } = useGetChatsQuery(undefined, {
    skip: !user?.id,
  });

  // Refs para no re-suscribir el socket cuando cambian.
  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const hasRoleRef = useRef(hasRole);
  hasRoleRef.current = hasRole;

  useEffect(() => {
    if (!socket || !user?.id) return;
    const emitter = socket as unknown as SocketEmitterLike;
    const myId = user.id;
    const isEnglish = language === "en";

    const onNew = (payload: MessageNewPayload) => {
      const msg: ChatMessage | undefined = payload?.message;
      if (!msg || msg.sender_id === myId) return;
      if (pathname?.endsWith("/messages")) return;

      const chat = chatsRef.current.find((c) => c.bookingId === msg.booking_id);
      const role = chat?.role;
      const basePath =
        role === "host" ||
        (!role &&
          (hasRoleRef.current("host") || hasRoleRef.current("admin")))
          ? "/dashboard/messages"
          : "/account/messages";

      const senderName =
        [msg.sender?.first_name, msg.sender?.last_name]
          .filter(Boolean)
          .join(" ") ||
        msg.sender?.username ||
        (isEnglish ? "New message" : "Nuevo mensaje");
      const preview =
        msg.kind === "location"
          ? isEnglish
            ? "📍 Shared location"
            : "📍 Ubicación compartida"
          : (msg.body ?? "").slice(0, 90);

      vibrateTap(30);
      toast.message(senderName, {
        description: preview,
        duration: 6000,
        action: {
          label: isEnglish ? "View" : "Ver",
          onClick: () => router.push(`${basePath}?booking=${msg.booking_id}`),
        },
      });
    };

    emitter.on("message:new", onNew);
    return () => {
      emitter.off("message:new", onNew);
    };
  }, [socket, user?.id, pathname, language, router]);

  return null;
}
