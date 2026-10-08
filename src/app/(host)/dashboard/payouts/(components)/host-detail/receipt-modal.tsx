"use client";

import { format } from "date-fns";
import { Download, ExternalLink, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n-context";
import type { PayoutRecord } from "@/types/payout";

interface Props {
  record: PayoutRecord | null;
  onClose: () => void;
}

export function ReceiptModal({ record, onClose }: Props) {
  const { t } = useLanguage();

  if (!record) return null;

  const isPdf = record.receiptUrl.toLowerCase().includes(".pdf");
  const dateTime = record.paymentTime
    ? format(
        new Date(`${record.paymentDate}T${record.paymentTime}`),
        "MMM d, yyyy — HH:mm",
      )
    : record.paymentDate;

  return (
    <Dialog open={record !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("payouts.receipt.title")}
          </DialogTitle>
          <DialogDescription>
            {t("payouts.history.methodBankTransfer")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("payouts.receipt.date")}</span>
            <span className="font-medium">{dateTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("payouts.receipt.amount")}</span>
            <span className="font-medium">${parseFloat(record.amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("payouts.receipt.host")}</span>
            <span className="font-medium">{record.hostName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("payouts.receipt.reference")}</span>
            <span className="font-medium">{record.transactionReference || "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t("payouts.receipt.status")}</span>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              {t("payouts.receipt.statusPaid")}
            </Badge>
          </div>
        </div>

        {record.receiptUrl ? (
          <div className="overflow-hidden rounded-lg border bg-black/5">
            {isPdf ? (
              <iframe
                src={record.receiptUrl}
                title="Receipt PDF"
                className="h-80 w-full"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={record.receiptUrl}
                alt="Receipt"
                className="mx-auto max-h-80 w-auto object-contain"
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-10 text-sm text-muted-foreground">
            {t("payouts.receipt.noReceipt")}
          </div>
        )}

        <DialogFooter>
          {record.receiptUrl && (
            <>
              <Button variant="outline" asChild>
                <a href={record.receiptUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-1.5 h-4 w-4" />
                  {t("payouts.receipt.download")}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={record.receiptUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  {t("payouts.receipt.openInNewTab")}
                </a>
              </Button>
            </>
          )}
          <Button onClick={onClose}>{t("payouts.receipt.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
