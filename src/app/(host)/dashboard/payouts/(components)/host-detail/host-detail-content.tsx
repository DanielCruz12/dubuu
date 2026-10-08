"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  BadgeCheck,
  Clock,
  DollarSign,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import {
  useGetHostPaymentDetailQuery,
  useGetHostPaymentHistoryQuery,
} from "@/redux/slices/payout/payout-slice";
import type { HostPayoutStatus, PayoutRecord } from "@/types/payout";
import { HostHistoryTable } from "./host-history-table";
import { BankDetailsCard } from "./bank-details-card";
import { RegisterPaymentModal } from "./register-payment-modal";
import { ReceiptModal } from "./receipt-modal";

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Próximo viernes (los hosts reciben su pago cada viernes). */
function nextFriday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=domingo … 5=viernes
  let diff = (5 - day + 7) % 7;
  if (diff === 0) diff = 7; // si hoy es viernes, el siguiente
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
}

function HostStatusBadge({ status }: { status: HostPayoutStatus }) {
  const { t } = useLanguage();
  const styles: Record<HostPayoutStatus, string> = {
    paid: "bg-green-500/10 text-green-600 border-green-500/20",
    partial: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    pending: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  const labelKeys: Record<HostPayoutStatus, string> = {
    paid: "payouts.hostsTable.statusPaid",
    partial: "payouts.hostsTable.statusPartial",
    pending: "payouts.hostsTable.statusPending",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {t(labelKeys[status])}
    </Badge>
  );
}

interface Props {
  hostId: string;
}

export function HostPaymentDetailsContent({ hostId }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState<PayoutRecord | null>(null);

  const detailQuery = useGetHostPaymentDetailQuery(hostId);
  const recentQuery = useGetHostPaymentHistoryQuery({
    hostId,
    page: 1,
    pageSize: 5,
  });

  const detail = detailQuery.data;
  const recent = recentQuery.data?.data ?? [];

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
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
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

  return (
    <div className="p-4 md:p-5 space-y-5 max-w-6xl">
      <Link href="/dashboard/payouts">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {t("payouts.hostDetail.backToPayouts")}
        </Button>
      </Link>

      {/* Cabecera del host */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.imageUrl || undefined} alt={user.displayName} />
            <AvatarFallback>
              {user.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold truncate">
                {user.displayName}
              </h1>
              <HostStatusBadge status={finances.status} />
            </div>
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
        <Button variant="outline" size="sm" onClick={() => setActiveTab("bank")}>
          {t("payouts.hostDetail.viewEditPaymentDetails")}
        </Button>
      </div>

      {/* Estadísticas + barra de progreso */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
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
          <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              <p className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase leading-none">
                {t("payouts.hostDetail.statOutstanding")}
              </p>
            </div>
            <span className="text-base md:text-lg font-bold tabular-nums text-orange-600">
              {fmt(finances.outstanding)}
            </span>
          </div>
        </div>
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
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t("payouts.hostDetail.tabOverview")}</TabsTrigger>
          <TabsTrigger value="history">{t("payouts.hostDetail.tabHistory")}</TabsTrigger>
          <TabsTrigger value="bank">{t("payouts.hostDetail.tabBank")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3 space-y-4">
          {/* Próximo pago (cada viernes) */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {t("payouts.hostDetail.nextPayment")}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {t("payouts.hostDetail.estimatedDate")}:{" "}
                  {format(nextFriday(), "MMM d, yyyy")}
                </span>
                <span>
                  {t("payouts.hostDetail.amount")}:{" "}
                  <span className="font-semibold text-foreground">
                    {fmt(finances.outstanding)}
                  </span>
                </span>
                <span>
                  {t("payouts.hostDetail.status")}:{" "}
                  <span className="font-semibold text-amber-600">
                    {t("payouts.hostsTable.statusPending")}
                  </span>
                </span>
              </div>
            </div>
            <Button onClick={() => setRegisterOpen(true)}>
              <DollarSign className="mr-1.5 h-4 w-4" />
              {t("payouts.hostDetail.registerPayment")}
            </Button>
          </div>

          {/* Pagos recientes */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">
              {t("payouts.hostDetail.recentPayments")}
            </p>
            {recentQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                {t("payouts.hostDetail.noPaymentsYet")}
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">{t("payouts.table.date")}</th>
                      <th className="px-3 py-2 font-medium text-right">{t("payouts.table.amount")}</th>
                      <th className="px-3 py-2 font-medium">{t("payouts.table.method")}</th>
                      <th className="px-3 py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                          {format(new Date(`${r.paymentDate}T${r.paymentTime || "00:00"}`), "MMM d, yyyy")}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-emerald-600">
                          ${parseFloat(r.amount).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 capitalize">{r.paymentMethod.replace("_", " ")}</td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setReceiptRecord(r)}
                          >
                            {t("payouts.hostDetail.viewReceipt")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-3">
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
