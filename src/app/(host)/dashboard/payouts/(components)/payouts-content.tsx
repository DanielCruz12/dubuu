"use client";

import { useState, useMemo } from "react";
import { startOfMonth, endOfDay } from "date-fns";
import type { DatePreset } from "./payouts-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { DashboardTitle } from "@/components/dashboard-title";
import { useLanguage } from "@/lib/i18n-context";
import { SummaryCards } from "./summary-cards";
import { PayoutsFilters } from "./payouts-filters";
import { PayoutsTable } from "./payouts-table";
import { PayoutHistoryTable } from "./payout-history-table";
import {
  useGetPayoutSummaryQuery,
  useGetPayoutBookingsQuery,
  useGetPayoutHistoryQuery,
  useGetHostsQuery,
} from "@/redux/slices/payout/payout-slice";
import type { PayoutFilters } from "@/types/payout";

export function PayoutsContent() {
  const { t } = useLanguage();
  const [datePreset, setDatePreset] = useState<DatePreset>("month");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(endOfDay(new Date()));
  const [hostId, setHostId] = useState<string | undefined>();
  const [productId, setProductId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [activeTab, setActiveTab] = useState("pending");

  const filters: PayoutFilters = useMemo(
    () => ({ dateFrom: dateFrom?.toISOString(), dateTo: dateTo?.toISOString(), hostId, productId }),
    [dateFrom, dateTo, hostId, productId],
  );

  const bookingFilters: PayoutFilters = useMemo(
    () => ({ ...filters, payoutStatus: activeTab === "pending" ? "pending" : undefined, page, pageSize: 20 }),
    [filters, activeTab, page],
  );

  const summaryQuery = useGetPayoutSummaryQuery(filters);
  const bookingsQuery = useGetPayoutBookingsQuery(bookingFilters);
  const historyQuery = useGetPayoutHistoryQuery({ ...filters, page: historyPage, pageSize: 20 });

  const pendingCountQuery = useGetPayoutBookingsQuery({ ...filters, payoutStatus: "pending", page: 1, pageSize: 1 });
  const historyCountQuery = useGetPayoutHistoryQuery({ ...filters, page: 1, pageSize: 1 });

  const hostsQuery = useGetHostsQuery();

  const pendingCount = pendingCountQuery.data?.total ?? undefined;
  const historyCount = historyCountQuery.data?.total ?? undefined;

  const loading = summaryQuery.isLoading || hostsQuery.isLoading;
  const error = summaryQuery.error || hostsQuery.error;

  return (
    <div className="p-4 md:p-5 space-y-5 max-w-6xl">
      <DashboardTitle
        heading={t("payouts.title")}
        description={t("payouts.description")}
      />

      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{t("payouts.error.title")}</p>
            <p className="text-sm">{t("payouts.error.description")}</p>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="space-y-2.5">
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <SummaryCards summary={summaryQuery.data} />
          )}

          <PayoutsFilters
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            hostId={hostId}
            onHostIdChange={(id) => { setHostId(id); setProductId(undefined); setPage(1); }}
            hosts={hostsQuery.data ?? []}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending" className="gap-1.5">
                {t("payouts.tabs.pending")}
                {pendingCount !== undefined && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-muted-foreground/15 px-1.5 text-xs font-medium">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                {t("payouts.tabs.history")}
                {historyCount !== undefined && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-muted-foreground/15 px-1.5 text-xs font-medium">
                    {historyCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-3">
              {bookingsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <PayoutsTable
                  data={bookingsQuery.data}
                  page={page}
                  onPageChange={setPage}
                  isLoading={bookingsQuery.isFetching}
                  onViewHistory={() => setActiveTab("history")}
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-3">
              {historyQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <PayoutHistoryTable
                  data={historyQuery.data}
                  page={historyPage}
                  onPageChange={setHistoryPage}
                  isLoading={historyQuery.isFetching}
                />
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
