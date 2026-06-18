"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLanguage } from "@/lib/i18n-context";
import { FileText } from "lucide-react";
import type { PayoutHistoryResponse } from "@/types/payout";

interface Props {
  data: PayoutHistoryResponse | undefined;
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function PayoutHistoryTable({ data, page, onPageChange, isLoading }: Props) {
  const { t } = useLanguage();
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.pageSize ?? 20)));

  if (!rows.length && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/50">
          <FileText className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("payouts.empty.historyTitle")}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {t("payouts.empty.historyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("payouts.table.date")}</TableHead>
              <TableHead>{t("payouts.table.host")}</TableHead>
              <TableHead>{t("payouts.table.product")}</TableHead>
              <TableHead className="text-right">{t("payouts.table.amountPaid")}</TableHead>
              <TableHead>{t("payouts.table.method")}</TableHead>
              <TableHead>{t("payouts.table.notes")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(r.paidAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </TableCell>
                <TableCell className="font-medium">{r.hostName}</TableCell>
                <TableCell>{r.productName}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  ${parseFloat(r.hostEarnings).toFixed(2)}
                </TableCell>
                <TableCell>{r.paymentMethod || "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {r.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
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
            onClick={() => onPageChange(page + 1)}
          >
            {t("payouts.table.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
