"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Download, FileText, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";
import { useGetHostPaymentHistoryQuery } from "@/redux/slices/payout/payout-slice";
import type { PayoutRecord } from "@/types/payout";

interface Props {
  hostId: string;
  onViewReceipt: (record: PayoutRecord) => void;
}

const PAGE_SIZE = 20;

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "payouts.history.methodBankTransfer",
  cash: "payouts.history.methodCash",
  other: "payouts.history.methodOther",
};

export function HostHistoryTable({ hostId, onViewReceipt }: Props) {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const query = useGetHostPaymentHistoryQuery({
    hostId,
    dateFrom: dateFrom?.toISOString(),
    dateTo: dateTo?.toISOString(),
    search: search || undefined,
    method: method === "all" ? undefined : method,
    page,
    pageSize: PAGE_SIZE,
  });

  const rows = query.data?.data ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const methodLabel = (m: string) => {
    const key = METHOD_LABELS[m];
    return key ? t(key) : m || "—";
  };

  const formatDate = (date: string, time: string) => {
    if (!date) return "—";
    const [year, month, day] = date.split("-");
    if (!year || !month || !day) return date;
    const base = `${day}/${month}/${year}`;
    return time ? `${base} ${time.slice(0, 5)}` : base;
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      params.append("hostId", hostId);
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
    <div className="space-y-3">
      {/* Filtros del historial */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("payouts.hostDetail.historySearchPlaceholder")}
            className="h-8 w-full pl-8"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 min-w-[190px] justify-start font-normal">
              <CalendarIcon className="mr-2 h-3 w-3 opacity-50" />
              {dateFrom && dateTo
                ? `${format(dateFrom, "dd MMM", { locale: es })} - ${format(dateTo, "dd MMM", { locale: es })}`
                : t("payouts.filters.dateRange")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateFrom, to: dateTo }}
              onSelect={(range) => {
                if (range) {
                  setDateFrom(range.from);
                  setDateTo(range.to);
                  setPage(1);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select
          value={method}
          onValueChange={(v) => {
            setMethod(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("payouts.hostDetail.historyAllMethods")}</SelectItem>
            <SelectItem value="bank_transfer">{t("payouts.history.methodBankTransfer")}</SelectItem>
            <SelectItem value="cash">{t("payouts.history.methodCash")}</SelectItem>
            <SelectItem value="other">{t("payouts.history.methodOther")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-8 font-normal"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Download className="mr-2 h-3 w-3" />
            )}
            {t("payouts.filters.export")}
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <FileText className="mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {t("payouts.hostDetail.historyEmpty")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("payouts.table.date")}</TableHead>
                <TableHead className="text-right">{t("payouts.table.amount")}</TableHead>
                <TableHead>{t("payouts.table.method")}</TableHead>
                <TableHead>{t("payouts.table.reference")}</TableHead>
                <TableHead>{t("payouts.hostsTable.colStatus")}</TableHead>
                <TableHead>{t("payouts.hostDetail.receiptColumn")}</TableHead>
                <TableHead>{t("payouts.table.notes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(r.paymentDate, r.paymentTime)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">
                    ${parseFloat(r.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{methodLabel(r.paymentMethod)}</TableCell>
                  <TableCell>{r.transactionReference || "—"}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      {t("payouts.receipt.statusPaid")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={!r.receiptUrl}
                      onClick={() => onViewReceipt(r)}
                    >
                      {t("payouts.hostDetail.viewReceipt")}
                    </Button>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {r.notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t("payouts.table.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("payouts.table.pageOf").replace("{{page}}", String(page)).replace("{{total}}", String(totalPages))}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t("payouts.table.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
