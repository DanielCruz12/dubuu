"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  BadgeCheck,
  DollarSign,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";
import { useGetHostPaymentDetailQuery } from "@/redux/slices/payout/payout-slice";
import type { PayoutRecord } from "@/types/payout";
import { HostHistoryTable } from "./host-history-table";
import { BankDetailsCard } from "./bank-details-card";
import { RegisterPaymentModal } from "./register-payment-modal";
import { ReceiptModal } from "./receipt-modal";

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Props {
  hostId: string;
}

export function HostPaymentDetailsContent({ hostId }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("history");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState<PayoutRecord | null>(null);

  const detailQuery = useGetHostPaymentDetailQuery(hostId);

  const detail = detailQuery.data;

  if (detailQuery.isLoading || !detail) {
    return (
      <div className="p-4 md:p-5 space-y-5 max-w-6xl">
        <Skeleton className="h-6 w-40 rounded" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-56 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="p-4 md:p-5 max-w-6xl">
        <Link href="/dashboard/payouts">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t("payouts.hostDetail.backToPayouts")}
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-destructive">{t("payouts.error.description")}</p>
        </div>
      </div>
    );
  }

  const { user, finances } = detail;

  // Sin actividad (sin reservas completadas): no tiene sentido mostrar la
  // barra de progreso.
  const hasActivity = finances.totalToPay > 0 || finances.totalPaid > 0;

  return (
    <div className="p-4 md:p-5 space-y-5 max-w-6xl">
      <Link href="/dashboard/payouts">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {t("payouts.hostDetail.backToPayouts")}
        </Button>
      </Link>

      {/* Cabecera del host */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.imageUrl || undefined} alt={user.displayName} />
          <AvatarFallback>
            {user.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate">
            {user.displayName}
          </h1>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
            {user.phoneNumber && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user.phoneNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas + barra de progreso */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="h-3.5 w-3.5 text-red-500" />
              <p className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase leading-none">
                {t("payouts.hostDetail.statTotalToPay")}
              </p>
            </div>
            <span className="text-base md:text-lg font-bold tabular-nums text-red-600">
              {fmt(finances.totalToPay)}
            </span>
          </div>
          <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              <p className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase leading-none">
                {t("payouts.hostDetail.statTotalPaid")}
              </p>
            </div>
            <span className="text-base md:text-lg font-bold tabular-nums text-emerald-600">
              {fmt(finances.totalPaid)}
            </span>
          </div>
        </div>
        {hasActivity && (
          <div className="rounded-lg border border-border/60 bg-card px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                {t("payouts.hostDetail.progressLabel").replace(
                  "{{percent}}",
                  String(finances.paidPercent),
                )}
              </p>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {finances.paidPercent}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${finances.paidPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs: solo Historial y Datos bancarios */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history">{t("payouts.hostDetail.tabHistory")}</TabsTrigger>
          <TabsTrigger value="bank">{t("payouts.hostDetail.tabBank")}</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-3 space-y-3">
          {finances.outstanding > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => setRegisterOpen(true)}>
                <DollarSign className="mr-1.5 h-4 w-4" />
                {t("payouts.hostDetail.registerPayment")}
              </Button>
            </div>
          )}
          <HostHistoryTable
            hostId={hostId}
            onViewReceipt={(record) => setReceiptRecord(record)}
          />
        </TabsContent>

        <TabsContent value="bank" className="mt-3">
          <BankDetailsCard hostId={hostId} />
        </TabsContent>
      </Tabs>

      <RegisterPaymentModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        hostId={hostId}
        hostName={user.displayName}
        outstanding={finances.outstanding}
      />

      <ReceiptModal
        record={receiptRecord}
        onClose={() => setReceiptRecord(null)}
      />
    </div>
  );
}
