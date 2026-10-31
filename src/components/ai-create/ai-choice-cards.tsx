"use client";

import { PenLine, Car, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

interface AiChoiceCardsProps {
  onAi: () => void;
  onManual: () => void;
  aiDisabled?: boolean;
  aiDisabledReason?: string;
  manualKindLabel?: string;
}

export function AiChoiceCards({
  onAi,
  onManual,
  aiDisabled,
  aiDisabledReason,
  manualKindLabel,
}: AiChoiceCardsProps) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {/* ── Crear con IA ── */}
      <button
        type="button"
        onClick={onAi}
        disabled={aiDisabled}
        aria-label={t("dashboard.aiCreate.aiCardTitle")}
        className={cn(
          "group relative flex flex-col text-left rounded-xl border p-3 overflow-hidden transition-all duration-300",
          "border-coast-400/30 bg-gradient-to-br from-coast-500/15 via-[#002B66]/60 to-coast-900/30 backdrop-blur-xl",
          "hover:border-coast-300/60 hover:shadow-[0_0_30px_rgba(51,150,255,0.28)] hover:-translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coast-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          aiDisabled &&
          "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none hover:border-coast-400/20",
        )}
      >
        <div className="pointer-events-none absolute inset-0 ai-shimmer opacity-70" />
        <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top_left,_rgba(117,184,255,0.22),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-coast-400/25 blur-3xl transition-colors duration-300 group-hover:bg-coast-400/40" />

        <div className="relative flex items-start justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-coast-400 to-coast-500 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-white shadow-[0_0_14px_rgba(51,150,255,0.5)]">
            {t("dashboard.aiCreate.aiCardBadge")}
          </span>
          {aiDisabled && <Lock className="h-4 w-4 text-coast-200" aria-hidden />}
        </div>

        <div className="relative mt-2 flex items-center gap-2">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full border border-coast-400/25" />
            <div className="relative h-10 w-10 rounded-xl bg-black/70 border border-coast-400/25 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Car className="h-5 w-5 text-coast-200" />
            </div>

          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-coast-300">
              {t("dashboard.aiCreate.aiKicker")}
            </p>
            <h3 className="text-base font-semibold tracking-tight text-white">{t("dashboard.aiCreate.aiCardTitle")}</h3>
          </div>
        </div>

        <p className="relative mt-1.5 text-[11px] leading-relaxed text-zinc-300">
          {t("dashboard.aiCreate.aiCardDescription")}
        </p>

        {aiDisabled ? (
          <p className="relative mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-coast-100">
            <Lock className="h-3.5 w-3.5" />
            {aiDisabledReason ?? t("dashboard.aiCreate.limitReached")}
          </p>
        ) : (
          <p className="relative mt-1.5 inline-flex items-center gap-1 text-[11px] text-coast-200/90">
            {t("dashboard.aiCreate.aiCardHint")}
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </p>
        )}
      </button>

      {/* ── Crear manualmente ── */}
      <button
        type="button"
        onClick={onManual}
        aria-label={t("dashboard.aiCreate.manualCardTitle")}
        className={cn(
          "group relative flex flex-col text-left rounded-xl border p-3 overflow-hidden transition-all duration-300",
          "border-white/10 bg-white/[0.03] backdrop-blur-xl",
          "hover:border-white/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05),transparent_55%)]" />

        <div className="relative flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-zinc-300">
            <PenLine className="h-3 w-3" />
            {t("dashboard.aiCreate.manualCardBadge")}
          </span>
          <span className="text-[9px] tracking-widest uppercase text-zinc-500">
            {manualKindLabel ?? t("dashboard.aiCreate.manualKindDefault")}
          </span>
        </div>

        <div className="relative mt-2 flex items-center gap-2">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <PenLine className="h-5 w-5 text-zinc-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {t("dashboard.aiCreate.manualKicker")}
            </p>
            <h3 className="text-base font-semibold tracking-tight text-white">{t("dashboard.aiCreate.manualCardTitle")}</h3>
          </div>
        </div>

        <p className="relative mt-1.5 text-[11px] leading-relaxed text-zinc-400">
          {t("dashboard.aiCreate.manualCardDescription")}
        </p>
      </button>
    </div>
  );
}
