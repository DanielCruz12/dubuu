"use client";

import { useState } from "react";
import { Smile } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/lib/i18n-context";
import {
  useRemoveReactionMutation,
  useUpsertReactionMutation,
} from "@/redux/slices/messaging/messaging-slice";
import { cn } from "@/lib/utils";
import type { MessageReactionGroup } from "@/types/messaging";

const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

interface ReactionsProps {
  messageId: string;
  bookingId: string;
  reactions: MessageReactionGroup[];
}

/** Chips con las reacciones agregadas del mensaje. */
export function ReactionChips({ messageId, bookingId, reactions }: ReactionsProps) {
  const { t } = useLanguage();
  const [upsert] = useUpsertReactionMutation();
  const [remove] = useRemoveReactionMutation();

  if (reactions.length === 0) return null;

  const handleChipClick = async (emoji: string, reactedByMe: boolean) => {
    try {
      if (reactedByMe) {
        await remove({ messageId, bookingId }).unwrap();
      } else {
        await upsert({ messageId, bookingId, emoji }).unwrap();
      }
    } catch {
      toast.error(t("messaging.conversation.sendError"));
    }
  };

  return (
    <span className="flex flex-wrap gap-1 pt-1">
      {reactions.map(({ emoji, count, reactedByMe }) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleChipClick(emoji, reactedByMe)}
          title={
            reactedByMe
              ? t("messaging.conversation.removeReaction")
              : t("messaging.conversation.react")
          }
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
            reactedByMe
              ? "border-primary bg-primary/10"
              : "border-border bg-background hover:bg-muted"
          )}
        >
          <span aria-hidden>{emoji}</span>
          {count > 1 && <span className="tabular-nums">{count}</span>}
        </button>
      ))}
    </span>
  );
}

/** Botón + popover para elegir una reacción. */
export function ReactionPicker({ messageId, bookingId, reactions }: ReactionsProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [upsert] = useUpsertReactionMutation();
  const [remove] = useRemoveReactionMutation();

  const myEmoji = reactions.find((r) => r.reactedByMe)?.emoji;

  const handlePick = async (emoji: string) => {
    setOpen(false);
    try {
      if (myEmoji === emoji) {
        await remove({ messageId, bookingId }).unwrap();
      } else {
        await upsert({ messageId, bookingId, emoji }).unwrap();
      }
    } catch {
      toast.error(t("messaging.conversation.sendError"));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
          aria-label={t("messaging.conversation.react")}
        >
          <Smile className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1.5" align="center" side="top">
        <span className="flex gap-0.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handlePick(emoji)}
              aria-label={emoji}
              className={cn(
                "rounded-md p-1 text-xl leading-none transition-transform hover:scale-125",
                myEmoji === emoji && "bg-primary/15"
              )}
            >
              {emoji}
            </button>
          ))}
        </span>
      </PopoverContent>
    </Popover>
  );
}
