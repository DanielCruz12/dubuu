"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, CreditCard, Users } from "lucide-react";
import moment from "moment";
import "moment/locale/es";
import { Overview } from "./overview";
import { RecentBookings } from "./recent-bookings";
import { DashboardTitle } from "@/components/dashboard-title";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/lib/i18n-context";
import { getHostEarningsFromTotalSum } from "@/lib/price";
import { useGetPanelSummaryQuery } from "@/redux/slices/panel/panel-slice";
import { useGetOwnPaymentHistoryQuery } from "@/redux/slices/payout/payout-slice";
import { HostHistoryTable } from "../payouts/(components)/host-detail/host-history-table";
import { ReceiptModal } from "../payouts/(components)/host-detail/receipt-modal";
import type { PayoutRecord } from "@/types/payout";

function getStatusLabelKey(status: string): string {
  if (status === "in-process") return "dashboard.status_inProcess";
  if (status === "completed") return "dashboard.status_completed";
  if (status === "pending") return "dashboard.status_pending";
  if (status === "cancelled") return "dashboard.status_cancelled";
  return "dashboard.status_pending";
}

export function DashboardContent() {
  const { user } = useUser();
  const userId = user?.id;
  const { t } = useLanguage();
  const [receiptRecord, setReceiptRecord] = useState<PayoutRecord | null>(null);
  const { data, isLoading, error } = useGetPanelSummaryQuery(userId ?? "", {
    skip: !userId,
  });
  // Solo para saber si el host tiene pagos registrados (la tabla hace su propia consulta paginada)
  const { data: ownHistory, isLoading: ownHistoryLoading } =
    useGetOwnPaymentHistoryQuery({ page: 1, pageSize: 1 }, { skip: !userId });

  const getStatusLabel = (status: string) => {
    const key = getStatusLabelKey(status);
    const label = t(key);
    return label === key ? status : label;
  };

  if (!userId) {
    return (
      <div className="flex flex-col gap-8 px-3 md:px-0">
        <DashboardTitle
          heading={t("dashboard.title")}
          description={t("dashboard.description")}
        />
        <p className="text-muted-foreground">{t("dashboard.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 px-3 md:px-0">
        <DashboardTitle
          heading={t("dashboard.title")}
          description={t("dashboard.description")}
        />
        <p className="text-destructive">{t("dashboard.error")}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-8 px-3 md:px-0">
        <DashboardTitle
          heading={t("dashboard.title")}
          description={t("dashboard.description")}
        />
        <p className="text-muted-foreground">{t("dashboard.loading")}</p>
      </div>
    );
  }

  const { activeReservations, totalRevenue, frequentTravelers, reservationActivity, upcomingReservations } = data;

  const totalCollected = Number(totalRevenue.total) || 0;
  const revenueAfterCommission = getHostEarningsFromTotalSum(totalCollected);

  const hasPaymentHistory = !ownHistoryLoading && (ownHistory?.total ?? 0) > 0;

  const activeSubtext =
    activeReservations.lastReservationAt != null
      ? t("dashboard.lastReservation").replace(
          "{{date}}",
          moment(activeReservations.lastReservationAt).format("D MMM YYYY")
        )
      : activeReservations.changeFromLastMonth === 0
        ? t("dashboard.noChangeSinceLastMonth")
        : activeReservations.changeFromLastMonth > 0
          ? `+${activeReservations.changeFromLastMonth} ${t("dashboard.sinceLastMonth")}`
          : `${activeReservations.changeFromLastMonth} ${t("dashboard.sinceLastMonth")}`;

  const revenueSubtext =
    totalRevenue.lastIncomeAt != null
      ? t("dashboard.lastIncome").replace(
          "{{date}}",
          moment(totalRevenue.lastIncomeAt).format("D MMM YYYY")
        )
      : totalRevenue.percentChangeFromLastYear === 0
        ? t("dashboard.noChangeSinceLastYear")
        : `${totalRevenue.percentChangeFromLastYear > 0 ? "+" : ""}${totalRevenue.percentChangeFromLastYear}% ${t("dashboard.sinceLastYear")}`;

  return (
    <div className="flex min-w-0 flex-col gap-8 px-3 md:px-0">
      <DashboardTitle
        heading={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.activeReservations")}
            </CardTitle>
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReservations.total}</div>
            <p className="text-xs text-muted-foreground">{activeSubtext}</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalRevenue")}
            </CardTitle>
            <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueAfterCommission.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{revenueSubtext}</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.frequentTravelers")}
            </CardTitle>
            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frequentTravelers.count}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.frequentTravelersSub")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="min-w-0 md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-1">
            <CardTitle>{t("dashboard.reservationActivity")}</CardTitle>
            <CardDescription>
              {t("dashboard.reservationActivityDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-x-auto pl-2">
            <Overview data={reservationActivity} />
          </CardContent>
        </Card>
        <Card className="min-w-0 md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-1">
            <CardTitle>{t("dashboard.upcomingReservations")}</CardTitle>
            <CardDescription>
              {upcomingReservations.total === 1
                ? t("dashboard.youHaveOneReservation")
                : t("dashboard.youHaveManyReservations").replace(
                    "{{count}}",
                    String(upcomingReservations.total)
                  )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentBookings
              data={upcomingReservations}
              viewAllLabel={t("dashboard.viewAllReservations")}
              getStatusLabel={getStatusLabel}
            />
          </CardContent>
        </Card>
        {/* Historial de pagos del host: 100% de ancho, debajo de actividad y próximas reservas.
            Solo se muestra si el host tiene pagos registrados. */}
        {hasPaymentHistory && (
          <Card className="min-w-0 md:col-span-2 lg:col-span-7">
            <CardHeader className="pb-1">
              <CardTitle>{t("dashboard.paymentHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <HostHistoryTable
                own
                showExport={false}
                onViewReceipt={(record) => setReceiptRecord(record)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <ReceiptModal
        record={receiptRecord}
        onClose={() => setReceiptRecord(null)}
      />
    </div>
  );
}
