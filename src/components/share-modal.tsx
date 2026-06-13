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
  image?: string;
}

export function ShareModal({
  title,
  url,
  description,
  image,
}: ShareModalProps) {
  const { t } = useLanguage();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      // Try Web Share API with image file (Level 2) when supported
      if (typeof navigator !== "undefined" && navigator.share) {
        const shareOpts: ShareData = {
          title,
          text: description || title,
          url,
        };

        // Attempt to include the image as a file for richer sharing
        if (image && navigator.canShare) {
          try {
            const res = await fetch(image);
            if (res.ok) {
              const blob = await res.blob();
              const ext = blob.type.split("/")[1] || "jpg";
              const file = new File(
                [blob],
                `${title.replace(/\s+/g, "-").substring(0, 40)}.${ext}`,
                { type: blob.type },
              );
              const withFiles: ShareData = { ...shareOpts, files: [file] };
              if (navigator.canShare(withFiles)) {
                await navigator.share(withFiles);
                return;
              }
            }
          } catch {
            // Image fetch or file share not supported, fall through to text-only
          }
        }

        await navigator.share(shareOpts);
      } else {
        // Fallback: copy URL to clipboard
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
