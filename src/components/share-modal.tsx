"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import { toast } from "sonner";

interface ShareModalProps {
  title: string;
  url: string;
  description?: string;
}

export function ShareModal({
  title,
  url,
  description,
}: ShareModalProps) {
  const { t } = useLanguage();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("home.share.alertCopied"));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Error sharing:", err);
        toast.error(t("home.share.alertUnavailable"));
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-full p-2"
      onClick={handleShare}
      disabled={sharing}
    >
      <Share2 className="h-4 w-4" />
      <span className="text-sm font-medium underline">
        {t("home.share.button")}
      </span>
    </Button>
  );
}
