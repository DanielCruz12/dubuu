"use client";

import {
  DollarSign,
  Percent,
  Clock,
  BadgeCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import type { PayoutSummary } from "@/types/payout";

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pctChange(current: number, previous: number | undefined): string | null {
  if (previous === undefined || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

interface Props {
  summary: PayoutSummary | undefined;
}

const FLOW_CARD_KEYS = [
  { key: "commission", icon: Percent, iconColor: "text-amber-500" },
  { key: "outstanding", icon: Clock, iconColor: "text-orange-500" },
] as const;

function PaidCard({ amount }: { amount: string }) {
  const { t } = useLanguage();
  return (
    <div className="h-full rounded-lg border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col justify-center h-full px-3 py-2.5 md:py-3">
        <div className="flex items-center gap-1.5 mb-1">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <p className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase leading-none">
            {t("payouts.cards.paid.label")}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed mb-1.5">
          {t("payouts.cards.paid.short")}
        </p>
        <span className="text-sm md:text-base lg:text-lg font-bold tabular-nums tracking-tight break-words">
          {amount}
        </span>
      </div>
    </div>
  );
}

export function SummaryCards({ summary }: Props) {
  const { t } = useLanguage();

  if (!summary) return null;

  const trend = pctChange(summary.totalCollected, summary.previousTotalCollected);
  const TrendIcon = trend?.startsWith("+") ? TrendingUp : TrendingDown;

  const valueMap: Record<string, string> = {
    collected: fmt(summary.totalCollected),
    paid: fmt(summary.totalPaid),
    commission: fmt(summary.totalCommission),
    outstanding: fmt(summary.outstanding),
  };

  return (
    <div className="space-y-2.5">
      {/* Hero: Total recaudado 100% (mobile) / 80% (desktop) + Total pagado al lado (desktop) */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="sm:basis-4/5 rounded-lg border border-border/60 bg-card shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 md:px-5 md:py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 ring-emerald-500/20">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
                  {t("payouts.cards.collected.label")}
                </p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed mt-0.5">
                  {t("payouts.cards.collected.short")}
                </p>
                {trend && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <TrendIcon className="h-3 w-3" />
                      {t("payouts.trend.vsLastMonth").replace("{{trend}}", trend)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span className="shrink-0 text-2xl md:text-3xl lg:text-4xl font-bold tabular-nums tracking-tight">
              {valueMap.collected}
            </span>
          </div>
        </div>

        <div className="hidden sm:block sm:basis-1/5">
          <PaidCard amount={valueMap.paid} />
        </div>
      </div>

      {/* Mobile: 3 cards en 3 columnas. Desktop: 2 cards (comisión + a pagar). */}
      <div className="grid grid-cols-3 sm:grid-cols-2 gap-2">
        <div className="sm:hidden">
          <PaidCard amount={valueMap.paid} />
        </div>
        {FLOW_CARD_KEYS.map((card) => (
          <div key={card.key} className="rounded-lg border border-border/60 bg-card hover:shadow-sm transition-shadow">
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <card.icon className={`h-3.5 w-3.5 shrink-0 ${card.iconColor}`} />
                <p className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase leading-none">
                  {t(`payouts.cards.${card.key}.label`)}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed mb-1.5">
                {t(`payouts.cards.${card.key}.short`)}
              </p>
              <span className="text-sm md:text-base font-bold tabular-nums tracking-tight">
                {valueMap[card.key]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
