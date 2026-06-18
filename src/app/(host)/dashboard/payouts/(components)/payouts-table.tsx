"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMarkBookingAsPaidMutation, useMarkBookingsAsPaidMutation } from "@/redux/slices/payout/payout-slice";
import { useLanguage } from "@/lib/i18n-context";
import { Wallet, ArrowRight } from "lucide-react";
import type { PayoutBookingsResponse } from "@/types/payout";

interface Props {
  data: PayoutBookingsResponse | undefined;
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onViewHistory?: () => void;
}

export function PayoutsTable({ data, page, onPageChange, isLoading, onViewHistory }: Props) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [singleBookingId, setSingleBookingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [markSingle] = useMarkBookingAsPaidMutation();
  const [markBatch] = useMarkBookingsAsPaidMutation();

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.pageSize ?? 20)));

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === rows.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(rows.map((r) => r.bookingId)));
  };

  const uploadFile = async (f: File): Promise<string | undefined> => {
    const formData = new FormData();
    formData.append("files", f);
    const res = await fetch("/backend/api/v1/files/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.files?.[0]?.s3Location as string | undefined;
  };

  const handleMarkSingle = async (bookingId: string) => {
    try {
      setUploading(true);
      let attachmentUrl: string | undefined;
      if (file) {
        attachmentUrl = await uploadFile(file);
      }
      await markSingle({ bookingId, paymentMethod: paymentMethod || undefined, notes: notes || undefined, attachmentUrl }).unwrap();
      toast.success(t("payouts.toast.markedAsPaid"));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(bookingId);
        return next;
      });
      setPaymentMethod("");
      setNotes("");
      setFile(null);
    } catch {
      toast.error(t("payouts.toast.errorMarking"));
    } finally {
      setUploading(false);
    }
    setSingleBookingId(null);
  };

  const handleMarkBatch = async () => {
    try {
      setUploading(true);
      let attachmentUrl: string | undefined;
      if (file) {
        attachmentUrl = await uploadFile(file);
      }
      await markBatch({ bookingIds: Array.from(selectedIds), paymentMethod: paymentMethod || undefined, notes: notes || undefined, attachmentUrl }).unwrap();
      toast.success(t("payouts.toast.batchMarkedAsPaid").replace("{{count}}", String(selectedIds.size)));
      setSelectedIds(new Set());
      setPaymentMethod("");
      setNotes("");
      setFile(null);
    } catch {
      toast.error(t("payouts.toast.errorMarking"));
    } finally {
      setUploading(false);
    }
    setConfirmOpen(false);
  };

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/50">
          <Wallet className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("payouts.empty.pendingTitle")}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {t("payouts.empty.pendingDesc")}
        </p>
        {onViewHistory && (
          <Button variant="outline" size="sm" className="mt-4 h-8 text-xs" onClick={onViewHistory}>
            <ArrowRight className="mr-1.5 h-3 w-3" />
            {t("payouts.empty.viewHistory")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">{t("payouts.table.selected").replace("{{count}}", String(selectedIds.size))}</span>
          <Button size="sm" onClick={() => setConfirmOpen(true)}>
            {t("payouts.table.markAsPaid")}
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={rows.length > 0 && selectedIds.size === rows.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>{t("payouts.table.host")}</TableHead>
              <TableHead>{t("payouts.table.product")}</TableHead>
              <TableHead className="text-right">{t("payouts.table.total")}</TableHead>
              <TableHead className="text-right">{t("payouts.table.commission")}</TableHead>
              <TableHead className="text-right">{t("payouts.table.hostEarnings")}</TableHead>
              <TableHead>{t("payouts.table.status")}</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.bookingId}>
                <TableCell>
                  {r.payoutStatus === "pending" && (
                    <Checkbox
                      checked={selectedIds.has(r.bookingId)}
                      onCheckedChange={() => toggleSelect(r.bookingId)}
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{r.hostName}</TableCell>
                <TableCell>{r.productName}</TableCell>
                <TableCell className="text-right">${parseFloat(r.total).toFixed(2)}</TableCell>
                <TableCell className="text-right text-amber-600">
                  ${parseFloat(r.commission).toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  ${parseFloat(r.hostEarnings).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={r.payoutStatus === "paid" ? "default" : "secondary"}>
                    {r.payoutStatus === "paid" ? t("payouts.table.status_paid") : t("payouts.table.status_pending")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {r.payoutStatus === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSingleBookingId(r.bookingId)}
                      disabled={isLoading}
                    >
                      {t("payouts.table.pay")}
                    </Button>
                  )}
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

      <AlertDialog
        open={confirmOpen || singleBookingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmOpen(false);
            setSingleBookingId(null);
            setPaymentMethod("");
            setNotes("");
            setFile(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("payouts.confirmDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {singleBookingId
                ? t("payouts.confirmDialog.descriptionSingle")
                : t("payouts.confirmDialog.descriptionBatch").replace("{{count}}", String(selectedIds.size))}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="payment-method">{t("payouts.confirmDialog.paymentMethod")}</Label>
              <Input
                id="payment-method"
                placeholder={t("payouts.confirmDialog.paymentMethodPlaceholder")}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-notes">{t("payouts.confirmDialog.notes")}</Label>
              <Textarea
                id="payment-notes"
                placeholder={t("payouts.confirmDialog.notesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-file">{t("payouts.confirmDialog.attachment")}</Label>
              <Input
                id="payment-file"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("payouts.confirmDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (singleBookingId) handleMarkSingle(singleBookingId); else handleMarkBatch(); }}
              disabled={uploading}
            >
              {uploading ? t("payouts.confirmDialog.uploading") : t("payouts.confirmDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
