"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, LayoutDashboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n-context";

interface AiSuccessStepProps {
  productId?: string;
  productName?: string;
  onClose: () => void;
}

export function AiSuccessStep({ productId, productName, onClose }: AiSuccessStepProps) {
  const { t } = useLanguage();
  return (
    <div className="text-center space-y-6 py-2">
      <div className="relative mx-auto h-20 w-20">
        <div className="absolute -inset-3 rounded-full bg-coast-500/25 blur-xl ai-glow-pulse" />
        <div className="absolute -inset-1 rounded-full border border-coast-400/30" />
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-coast-300 to-coast-600 flex items-center justify-center shadow-[0_0_40px_rgba(51,150,255,0.55)] animate-in zoom-in duration-300">
          <CheckCircle2 className="h-9 w-9 text-white" />
        </div>
      </div>

      <div>
        <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-coast-300">
          <Sparkles className="h-3 w-3" />
          {t("dashboard.aiCreate.successKicker")}
        </p>
        <h3 className="text-2xl font-semibold tracking-tight text-white mt-2">
          {t("dashboard.aiCreate.doneTitle")}
        </h3>
        <p className="text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
          {productName ? (
            <>
              <span className="text-white font-medium">{productName}</span> {t("dashboard.aiCreate.successSavedAs")}
            </>
          ) : (
            t("dashboard.aiCreate.successSavedGeneric")
          )}{" "}
          {t("dashboard.aiCreate.successHidden")}
        </p>
      </div>

      <div className="ai-panel p-4 text-left max-w-md mx-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t("dashboard.aiCreate.successNextStep")}
        </p>
        <p className="text-sm text-zinc-300 mt-1.5">
          {t("dashboard.aiCreate.successNextText")}
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          {productId && (
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-coast-400 to-coast-500 text-white hover:from-coast-300 hover:to-coast-400"
            >
              <Link href={`/dashboard/products/add?edit=${encodeURIComponent(productId)}`}>
                {t("dashboard.aiCreate.successViewEdit")}
                <ExternalLink className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="flex-1 border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
            onClick={onClose}
          >
            <Link href="/dashboard/products">
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              {t("dashboard.aiCreate.successGoProducts")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
