"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Eye, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetHostsTableQuery } from "@/redux/slices/payout/payout-slice";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import type { HostPayoutStatus, HostsTableRow } from "@/types/payout";

type SortKey = "username" | "totalToPay" | "totalPaid" | "lastPayment";

interface Props {
  dateFrom?: string;
  dateTo?: string;
  /** Fila superior de la barra (controles extra), a la izquierda del estado. */
  toolbarTopLeft?: React.ReactNode;
  /** Fila principal, después del buscador (ej. período y fechas). */
  toolbarMainLeft?: React.ReactNode;
  /** Controles al final de la fila principal (ej. Exportar). */
  toolbarRight?: React.ReactNode;
}

const PAGE_SIZE = 20;

const SORTABLE_COLUMNS: { key: SortKey; labelKey: string; align?: "right"; width?: string }[] = [
  { key: "username", labelKey: "payouts.hostsTable.colHost" },
  { key: "totalToPay", labelKey: "payouts.hostsTable.colToPay", align: "right", width: "min-w-[130px]" },
  { key: "totalPaid", labelKey: "payouts.hostsTable.colPaid", align: "right" },
  { key: "lastPayment", labelKey: "payouts.hostsTable.colLastPayment" },
];

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: HostPayoutStatus }) {
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

function SortableHeader({
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  column: (typeof SORTABLE_COLUMNS)[number];
  sortBy: SortKey;
  sortOrder: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const { t } = useLanguage();
  const active = sortBy === column.key;
  return (
    <TableHead className={cn(column.align === "right" ? "text-right" : undefined, column.width)}>
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground transition-colors",
          active && "text-foreground",
        )}
      >
        {t(column.labelKey)}
        {active ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    </TableHead>
  );
}

/**
 * Tabla ligera de todos los hosts (Fase 3 del panel admin).
 * Solo resumen por host; el detalle se carga en otra página al pulsar View.
 * Por defecto ordena por outstanding desc: primero a quienes más se les debe.
 */
export function HostsTable({ dateFrom, dateTo, toolbarTopLeft, toolbarMainLeft, toolbarRight }: Props) {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  // Por defecto solo los pendientes: no cargamos toda la tabla de una vez.
  const [status, setStatus] = useState<HostPayoutStatus | "all">("pending");
  const [sortBy, setSortBy] = useState<SortKey>("totalToPay");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Debounce de búsqueda.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const query = useGetHostsTableQuery({
    dateFrom,
    dateTo,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    sortBy,
    sortOrder,
    page,
    pageSize: PAGE_SIZE,
  });

  const rows: HostsTableRow[] = query.data?.data ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder(key === "username" ? "asc" : "desc");
    }
    setPage(1);
  };

  const resetFilters = () => {
    setStatus("pending");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-3">
      {/* Fila superior: host + estado, a la par en desktop y mobile (host primero) */}
      <div className="flex flex-wrap items-center gap-2">
        {toolbarTopLeft}
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as HostPayoutStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("payouts.hostsTable.statusAll")}</SelectItem>
            <SelectItem value="pending">{t("payouts.hostsTable.statusPending")}</SelectItem>
            <SelectItem value="partial">{t("payouts.hostsTable.statusPartial")}</SelectItem>
            <SelectItem value="paid">{t("payouts.hostsTable.statusPaid")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fila principal: buscador (más largo, al inicio), período, fechas
          (solo con Personalizado) y Exportar al final. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64 lg:w-72">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("payouts.hostsTable.searchPlaceholder")}
            className="h-8 w-full pl-8"
          />
        </div>
        {toolbarMainLeft}
        <div className="ml-auto">{toolbarRight}</div>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
          <p className="text-sm font-semibold">{t("payouts.hostsTable.emptyTitle")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("payouts.hostsTable.emptyDesc")}</p>
          {(search || status !== "all") && (
            <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
              {t("payouts.hostsTable.clearFilters")}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {SORTABLE_COLUMNS.map((column) => (
                  <SortableHeader
                    key={column.key}
                    column={column}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                ))}
                <TableHead>{t("payouts.hostsTable.colStatus")}</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.hostId}>
                  <TableCell className="font-medium">{row.username}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium min-w-[130px]",
                      row.totalToPay > 0 ? "text-red-600" : "text-green-600",
                    )}
                  >
                    {fmt(row.totalToPay)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      // Si aún se debe al host, "Pagado" va en rojo aunque sea 0.00.
                      row.outstanding > 0 ? "text-red-600" : "text-green-600",
                    )}
                  >
                    {fmt(row.totalPaid)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {row.lastPayment
                      ? format(new Date(row.lastPayment), "dd/MM/yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/payouts/hosts/${encodeURIComponent(row.hostId)}`}
                    >
                      <Button size="sm" variant="outline" className="h-8">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        {t("payouts.hostsTable.view")}
                      </Button>
                    </Link>
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
