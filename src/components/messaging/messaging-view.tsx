"use client";

import { MessageCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { DashboardTitle } from "@/components/dashboard-title";
import { useLanguage } from "@/lib/i18n-context";
import { useGetChatsQuery } from "@/redux/slices/messaging/messaging-slice";
import { cn } from "@/lib/utils";
import { ChatList } from "./chat-list";
import { Conversation } from "./conversation";

interface MessagingViewProps {
  activeBookingId: string | null;
  basePath: "/account/messages" | "/dashboard/messages";
  bookingsPath: "/account/bookings" | "/dashboard/bookings";
  isHostView: boolean;
}

/**
 * Vista de mensajes mobile-first: en móvil se ve la lista O la conversación;
 * en desktop (md+) ambas en columnas.
 */
export function MessagingView({
  activeBookingId,
  basePath,
  bookingsPath,
  isHostView,
}: MessagingViewProps) {
  const { t } = useLanguage();
  const { user } = useUser();
  const userId = user?.id;

  // La suscripción socket global vive en <MessagingNotifications /> (providers).

  const { data: chats = [], isLoading } = useGetChatsQuery(undefined, {
    skip: !userId,
  });

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading={t("messaging.title")}
        description={t("messaging.description")}
      />

      <div className="pt-4 md:grid md:grid-cols-[320px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Lista de chats: en móvil se oculta cuando hay un chat abierto */}
        <section
          aria-label={t("messaging.title")}
          className={cn(
            "md:block md:h-[calc(100dvh-220px)] md:overflow-y-auto md:rounded-lg md:border md:p-2",
            activeBookingId ? "hidden" : "block"
          )}
        >
          <ChatList
            chats={chats}
            isLoading={isLoading || !userId}
            activeBookingId={activeBookingId}
            basePath={basePath}
            bookingsPath={bookingsPath}
            isHostView={isHostView}
          />
        </section>

        {/* Conversación */}
        <section
          aria-label={t("messaging.conversation.selectChat")}
          className={cn(
            "md:block md:h-[calc(100dvh-220px)] flex-col md:flex md:rounded-lg md:border",
            activeBookingId ? "flex" : "hidden"
          )}
        >
          {activeBookingId ? (
            <Conversation bookingId={activeBookingId} basePath={basePath} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </span>
              <p className="font-semibold">
                {t("messaging.conversation.selectChat")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("messaging.conversation.selectChatHint")}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
