"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Download, FileText, Loader2 } from "lucide-react";
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

function isRemoteSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

export function ReceiptModal({ record, onClose }: Props) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);

  if (!record) return null;

  const isPdf = record.receiptUrl.toLowerCase().includes(".pdf");
  const dateTime = record.paymentTime
    ? format(
      new Date(`${record.paymentDate}T${record.paymentTime}`),
      "MMM d, yyyy — HH:mm",
    )
    : record.paymentDate;

  const handleDownload = async () => {
    if (!record.receiptUrl) return;
    try {
      setDownloading(true);
      const res = await fetch(record.receiptUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        record.transactionReference?.trim() || "comprobante";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Si no se puede descargar el blob (CORS, etc.), abrir en otra pestaña.
      window.open(record.receiptUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={record !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("payouts.receipt.title")}
          </DialogTitle>
          <DialogDescription>
            {t("payouts.registerPayment.methodBankTransfer")}
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
            <Badge className="bg-green-600 text-white">
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
              <div className="relative h-80 w-full">
                <Image
                  src={record.receiptUrl}
                  alt="Comprobante de pago"
                  fill
                  unoptimized={isRemoteSrc(record.receiptUrl)}
                  className="object-contain"
                  sizes="(max-width: 576px) 100vw, 576px"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-10 text-sm text-muted-foreground">
            {t("payouts.receipt.noReceipt")}
          </div>
        )}

        <DialogFooter>
          {record.receiptUrl && (
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              {t("payouts.receipt.download")}
            </Button>
          )}
          <Button onClick={onClose}>{t("payouts.receipt.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
