"use client";

import { useState, useMemo } from "react";
import { startOfMonth, endOfDay } from "date-fns";
import { PayoutPeriodFilter, type DatePreset } from "./payouts-filters";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardTitle } from "@/components/dashboard-title";
import { useLanguage } from "@/lib/i18n-context";
import { SummaryCards } from "./summary-cards";
import { HostsTable } from "./hosts-table";
import { useGetPayoutSummaryQuery } from "@/redux/slices/payout/payout-slice";
import type { PayoutFilters } from "@/types/payout";

export function PayoutsContent() {
  const { t } = useLanguage();
  const [datePreset, setDatePreset] = useState<DatePreset>("month");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(endOfDay(new Date()));
  const [exporting, setExporting] = useState(false);

  const filters: PayoutFilters = useMemo(
    () => ({ dateFrom: dateFrom?.toISOString(), dateTo: dateTo?.toISOString() }),
    [dateFrom, dateTo],
  );

  const summaryQuery = useGetPayoutSummaryQuery(filters);

  const loading = summaryQuery.isLoading;
  const error = summaryQuery.error;

  // Descarga el CSV del historial de pagos con los filtros activos.
  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom.toISOString());
      if (dateTo) params.append("dateTo", dateTo.toISOString());

      const res = await fetch(
        `/backend/api/v1/admin/payouts/export?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? "pagos_dubuu.csv";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(t("payouts.toast.exportSuccess"));
    } catch {
      toast.error(t("payouts.toast.exportError"));
    } finally {
      setExporting(false);
    }
  };

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
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <SummaryCards summary={summaryQuery.data} />
          )}

          {/* Tabla ligera de todos los hosts (Fase 3): usa el rango global.
              Barra: estado arriba; buscador, período, fechas (solo
              Personalizado) y Exportar abajo. */}
          <HostsTable
            dateFrom={dateFrom?.toISOString()}
            dateTo={dateTo?.toISOString()}
            toolbarMainLeft={
              <PayoutPeriodFilter
                datePreset={datePreset}
                onDatePresetChange={setDatePreset}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
              />
            }
            toolbarRight={
              <Button
                variant="outline"
                size="sm"
                className="font-normal"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3 w-3" />
                )}
                {exporting ? t("payouts.filters.exporting") : t("payouts.filters.export")}
              </Button>
            }
          />
        </>
      )}
    </div>
  );
}
