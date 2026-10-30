"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";
import {
  useGetChatsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useMarkReadMutation,
} from "@/redux/slices/messaging/messaging-slice";
import type { ChatMessage } from "@/types/messaging";
import { getDisplayName, getInitials } from "./messaging-utils";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";

const PAGE_SIZE = 100;
const NEAR_BOTTOM_PX = 120;

export function Conversation({
  bookingId,
  basePath,
}: {
  bookingId: string;
  basePath: string;
}) {
  const { t } = useLanguage();
  const { user } = useUser();
  const userId = user?.id;

  // Cabecera desde la caché de chats (sin request extra si la lista cargó).
  const { data: chats = [] } = useGetChatsQuery(undefined, { skip: !userId });
  const chat = chats.find((c) => c.bookingId === bookingId);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetMessagesQuery(
    { bookingId, limit: PAGE_SIZE },
    { skip: !userId }
  );
  const [fetchOlder, { isFetching: isFetchingOlder }] =
    useLazyGetMessagesQuery();
  const [markRead] = useMarkReadMutation();

  // Páginas anteriores acumuladas (más viejas primero).
  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState<boolean | null>(null);

  // Al cambiar de chat, reiniciar la paginación acumulada.
  useEffect(() => {
    setOlderMessages([]);
    setHasMoreOlder(null);
  }, [bookingId]);

  const messages = useMemo(() => {
    const fresh = data?.messages ?? [];
    if (olderMessages.length === 0) return fresh;
    const freshIds = new Set(fresh.map((m) => m.id));
    return [...olderMessages.filter((m) => !freshIds.has(m.id)), ...fresh];
  }, [data, olderMessages]);

  const hasMore = hasMoreOlder ?? data?.hasMore ?? false;

  const loadOlder = async () => {
    const oldest = messages[0];
    if (!oldest || isFetchingOlder) return;
    try {
      const page = await fetchOlder({
        bookingId,
        before: oldest.created_at,
        limit: PAGE_SIZE,
      }).unwrap();
      setOlderMessages((prev) => {
        const known = new Set([
          ...prev.map((m) => m.id),
          ...(data?.messages ?? []).map((m) => m.id),
        ]);
        return [...page.messages.filter((m) => !known.has(m.id)), ...prev];
      });
      setHasMoreOlder(page.hasMore);
    } catch {
      // El botón queda disponible para reintentar.
    }
  };

  // Marcar como leídos los mensajes del otro (al abrir y al llegar nuevos).
  const unreadFromOther = messages.some(
    (m) => m.sender_id !== userId && m.status !== "read"
  );
  useEffect(() => {
    if (!unreadFromOther || !userId) return;
    const id = window.setTimeout(() => {
      markRead(bookingId).catch(() => {});
    }, 600);
    return () => window.clearTimeout(id);
  }, [unreadFromOther, bookingId, userId, markRead]);

  // --- Scroll: al fondo al abrir; auto-scroll solo si ya estaba abajo ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);
  const prevFreshRef = useRef(0);

  const scrollToBottom = (smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    nearBottomRef.current = nearBottom;
    setStickToBottom(nearBottom);
    if (nearBottom) setUnseenCount(0);
  };

  // Solo los mensajes frescos (no los paginados hacia atrás) disparan
  // scroll o el contador de no vistos.
  const freshLength = data?.messages.length ?? 0;
  useEffect(() => {
    const prevFresh = prevFreshRef.current;
    prevFreshRef.current = freshLength;
    const isFirstLoad = prevFresh === 0 && freshLength > 0;
    const grew = freshLength > prevFresh;
    if (isFirstLoad || (grew && nearBottomRef.current)) {
      scrollToBottom();
      setUnseenCount(0);
    } else if (grew) {
      setUnseenCount((c) => c + (freshLength - prevFresh));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scroll intencional ante mensajes nuevos
  }, [freshLength]);

  // Prevenir salto visual al cargar anteriores: conservar la posición.
  const handleLoadOlder = async () => {
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    await loadOlder();
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - prevHeight;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Cabecera */}
      <header className="flex shrink-0 items-center gap-2 border-b p-2 sm:p-3">
        <Button asChild variant="ghost" size="icon" className="md:hidden">
          <Link href={basePath} aria-label={t("messaging.conversation.back")}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        {chat ? (
          <>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage
                src={chat.counterpart?.image_url ?? ""}
                alt={t("messaging.conversation.imageAlt")}
              />
              <AvatarFallback>
                {getInitials(chat.counterpart, t("messaging.unknownUser"))}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col text-left">
              <span className="truncate text-sm font-semibold">
                {getDisplayName(chat.counterpart, t("messaging.unknownUser"))}
              </span>
              {chat.product.name && (
                <span className="truncate text-xs text-muted-foreground">
                  {chat.product.name}
                </span>
              )}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </span>
          </>
        )}
      </header>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative min-h-0 flex-1 overflow-y-auto p-3 sm:p-4"
      >
        {isLoading || !userId ? (
          <ConversationSkeleton />
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              {t("messaging.conversation.loadError")}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t("messaging.conversation.retry")}
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <MessageCircle className="h-7 w-7 text-muted-foreground" />
            </span>
            <p className="font-semibold">
              {t("messaging.conversation.emptyTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("messaging.conversation.emptyHint")}
            </p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="mb-3 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadOlder}
                  disabled={isFetchingOlder}
                >
                  {isFetchingOlder && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  )}
                  {t("messaging.conversation.loadMore")}
                </Button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMine={message.sender_id === userId}
                />
              ))}
            </div>
          </>
        )}

        {!stickToBottom && unseenCount > 0 && (
          <Button
            size="sm"
            className="sticky bottom-2 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
            onClick={() => {
              scrollToBottom(true);
              setUnseenCount(0);
            }}
          >
            <ArrowDown className="mr-1 h-4 w-4" />
            {t("messaging.conversation.newMessages")} ({unseenCount})
          </Button>
        )}
      </div>

      <MessageComposer bookingId={bookingId} />
    </div>
  );
}

function ConversationSkeleton() {
  const { t } = useLanguage();
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-label={t("messaging.conversation.loading")}
    >
      <div className="flex justify-start">
        <Skeleton className="h-12 w-2/3 rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-1/2 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-14 w-3/5 rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-2/5 rounded-2xl rounded-br-md" />
      </div>
    </div>
  );
}
