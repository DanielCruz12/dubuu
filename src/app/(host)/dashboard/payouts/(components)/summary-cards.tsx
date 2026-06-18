"use client";

import {
  DollarSign,
  Percent,
  Users,
  BadgeCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
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

const CARD_KEYS = [
  { key: "collected", icon: DollarSign, iconBg: "bg-emerald-500/10 ring-emerald-500/20", iconColor: "text-emerald-500", hero: true },
  { key: "commission", icon: Percent, iconColor: "text-amber-500" },
  { key: "payable", icon: Users, iconColor: "text-sky-500" },
  { key: "paid", icon: BadgeCheck, iconColor: "text-emerald-600" },
  { key: "outstanding", icon: Clock, iconColor: "text-orange-500" },
] as const;

export function SummaryCards({ summary }: Props) {
  const { t } = useLanguage();

  if (!summary) return null;

  const trend = pctChange(summary.totalCollected, summary.previousTotalCollected);
  const TrendIcon = trend?.startsWith("+") ? TrendingUp : TrendingDown;

  const valueMap: Record<string, string> = {
    collected: fmt(summary.totalCollected),
    commission: fmt(summary.totalCommission),
    payable: fmt(summary.totalPayable),
    paid: fmt(summary.totalPaid),
    outstanding: fmt(summary.outstanding),
  };

  const hero = CARD_KEYS[0];
  const flow = CARD_KEYS.slice(1);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2.5">
        {/* Hero */}
        <div className="rounded-lg border border-border/60 bg-card shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 md:px-5 md:py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${hero.iconBg}`}>
                <hero.icon className={`h-4 w-4 ${hero.iconColor}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
                    {t("payouts.cards.collected.label")}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center justify-center rounded-full text-muted-foreground/35 hover:text-muted-foreground transition-colors">
                        <Info className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[260px]">
                      <p className="text-xs leading-relaxed">{t("payouts.cards.collected.long")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed mt-0.5">
                  {t("payouts.cards.collected.short")}
                </p>
                {(trend || summary.bookingCount !== undefined) && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    {trend && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <TrendIcon className="h-3 w-3" />
                        {t("payouts.trend.vsLastMonth").replace("{{trend}}", trend)}
                      </span>
                    )}
                    {summary.bookingCount !== undefined && (
                      <span className="text-[11px] text-muted-foreground">
                        {t("payouts.trend.bookings").replace("{{count}}", String(summary.bookingCount))}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <span className="shrink-0 text-2xl md:text-3xl lg:text-4xl font-bold tabular-nums tracking-tight">
              {valueMap.collected}
            </span>
          </div>
        </div>

        {/* Flow cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {flow.map((card) => (
            <div key={card.key} className="rounded-lg border border-border/60 bg-card hover:shadow-sm transition-shadow">
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <card.icon className={`h-3.5 w-3.5 shrink-0 ${card.iconColor}`} />
                  <p className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase leading-none">
                    {t(`payouts.cards.${card.key}.label`)}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center justify-center rounded-full text-muted-foreground/35 hover:text-muted-foreground transition-colors ml-auto">
                        <Info className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                      <p className="text-xs leading-relaxed">{t(`payouts.cards.${card.key}.long`)}</p>
                    </TooltipContent>
                  </Tooltip>
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
    </TooltipProvider>
  );
}
