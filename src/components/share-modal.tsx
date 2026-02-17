"use client";

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

/**
 * Botón de compartir que abre directamente la opción nativa del dispositivo (navigator.share).
 * No muestra modal; en dispositivos que lo soportan abre el diálogo del sistema.
 * Si el navegador no soporta compartir nativo, copia el enlace al portapapeles.
 */
export function ShareModal({
  title,
  url,
  description,
}: ShareModalProps) {
  const { t } = useLanguage();

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
          toast.error(t("home.share.alertUnavailable"));
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t("home.share.alertCopied"));
      } catch {
        toast.error(t("home.share.alertUnavailable"));
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-full p-2"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
      <span className="text-sm font-medium underline">{t("home.share.button")}</span>
    </Button>
  );
}
