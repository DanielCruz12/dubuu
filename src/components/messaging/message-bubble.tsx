"use client";

import dynamic from "next/dynamic";
import { Check, CheckCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";
import { useRelativeTime } from "@/hooks/use-relative-time";
import { cn } from "@/lib/utils";
import type { ChatMessage, MessageStatus } from "@/types/messaging";
import { ReactionChips, ReactionPicker } from "./message-reactions";

const LocationPreview = dynamic(
  () => import("./location-map").then((m) => m.LocationPreview),
  {
    ssr: false,
    loading: () => <Skeleton className="h-40 w-56 max-w-full sm:w-64" />,
  }
);

const STATUS_LABEL_KEY: Record<MessageStatus, string> = {
  sent: "messaging.conversation.sent",
  delivered: "messaging.conversation.delivered",
  read: "messaging.conversation.read",
};

/** Icono de estado: enviado ✓, entregado ✓✓, leído ✓✓ azul. */
function StatusIcon({ status }: { status: MessageStatus }) {
  const { t } = useLanguage();
  const label = t(STATUS_LABEL_KEY[status]);
  if (status === "sent") {
    return (
      <Check className="h-3.5 w-3.5" aria-label={label} role="img" />
    );
  }
  return (
    <CheckCheck
      className={cn("h-4 w-4", status === "read" && "text-sky-400")}
      aria-label={label}
      role="img"
    />
  );
}

export function MessageBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  const timeAgo = useRelativeTime(message.created_at);
  const isLocation =
    message.kind === "location" &&
    message.location_lat != null &&
    message.location_lng != null;

  return (
    <div
      className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "group flex max-w-[85%] flex-col sm:max-w-[75%]",
          isMine ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-3 py-2 shadow-sm",
            isMine
              ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
              : "rounded-2xl rounded-bl-md bg-muted"
          )}
        >
          {isLocation ? (
            <LocationPreview
              lat={Number(message.location_lat)}
              lng={Number(message.location_lng)}
              label={message.location_label}
            />
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.body}
            </p>
          )}

          <span
            className={cn(
              "mt-1 flex items-center justify-end gap-1 text-[11px] opacity-70",
              !isMine && "justify-start"
            )}
          >
            <span className="transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
              <ReactionPicker
                messageId={message.id}
                bookingId={message.booking_id}
                reactions={message.reactions}
              />
            </span>
            <span>{timeAgo}</span>
            {isMine && <StatusIcon status={message.status} />}
          </span>
        </div>

        <ReactionChips
          messageId={message.id}
          bookingId={message.booking_id}
          reactions={message.reactions}
        />
      </div>
    </div>
  );
}
