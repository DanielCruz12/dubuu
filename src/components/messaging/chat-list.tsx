"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";
import { useRelativeTime } from "@/hooks/use-relative-time";
import { cn } from "@/lib/utils";
import type { ChatListItem } from "@/types/messaging";
import {
  getDisplayName,
  getInitials,
  getLastMessagePreview,
} from "./messaging-utils";

interface ChatListProps {
  chats: ChatListItem[];
  isLoading: boolean;
  activeBookingId: string | null;
  basePath: string;
  bookingsPath: string;
  isHostView: boolean;
}

export function ChatList({
  chats,
  isLoading,
  activeBookingId,
  basePath,
  bookingsPath,
  isHostView,
}: ChatListProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div
        className="flex flex-col gap-1"
        role="status"
        aria-label={t("messaging.list.loading")}
      >
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="flex items-center gap-3 px-2 py-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="h-7 w-7 text-muted-foreground" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{t("messaging.list.emptyTitle")}</p>
          <p className="text-sm text-muted-foreground">
            {t(
              isHostView
                ? "messaging.list.emptyHostDescription"
                : "messaging.list.emptyTravelerDescription"
            )}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={bookingsPath}>{t("messaging.list.emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {chats.map((chat) => (
        <ChatListRow
          key={chat.bookingId}
          chat={chat}
          isActive={chat.bookingId === activeBookingId}
          basePath={basePath}
        />
      ))}
    </ul>
  );
}

function ChatListRow({
  chat,
  isActive,
  basePath,
}: {
  chat: ChatListItem;
  isActive: boolean;
  basePath: string;
}) {
  const { t } = useLanguage();
  const { user } = useUser();
  const timeAgo = useRelativeTime(chat.lastMessage?.created_at);

  const preview = getLastMessagePreview(chat.lastMessage, {
    noMessages: t("messaging.list.noMessages"),
    location: t("messaging.list.locationPreview"),
  });
  const isMine =
    !!user?.id &&
    !!chat.lastMessage &&
    chat.lastMessage.sender_id === user.id;

  return (
    <li>
      <Link
        href={`${basePath}?booking=${chat.bookingId}`}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/70",
          isActive && "bg-muted hover:bg-muted"
        )}
      >
        <Avatar className="h-11 w-11 shrink-0">
          <AvatarImage
            src={chat.counterpart?.image_url ?? ""}
            alt={t("messaging.conversation.imageAlt")}
          />
          <AvatarFallback>
            {getInitials(chat.counterpart, t("messaging.unknownUser"))}
          </AvatarFallback>
        </Avatar>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold">
              {getDisplayName(chat.counterpart, t("messaging.unknownUser"))}
            </span>
            {chat.lastMessage && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo}
              </span>
            )}
          </span>
          {chat.product.name && (
            <span className="truncate text-xs text-muted-foreground">
              {chat.product.name}
            </span>
          )}
          <span className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm",
                chat.unreadCount > 0
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {isMine && chat.lastMessage
                ? `${t("messaging.list.youPrefix")}: ${preview}`
                : preview}
            </span>
            {chat.unreadCount > 0 && (
              <Badge
                variant="default"
                className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[11px]"
              >
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </Badge>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}
