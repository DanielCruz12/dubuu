"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import { useRegisterPaymentMutation } from "@/redux/slices/payout/payout-slice";
import { filterDecimalChars, findBlockedChar, numericBlockedMessage } from "@/components/modules/add-tour/validation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostId: string;
  hostName: string;
  outstanding: number;
}

const ACCEPTED_RECEIPT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function RegisterPaymentModal({
  open,
  onOpenChange,
  hostId,
  hostName,
  outstanding,
}: Props) {
  const { t } = useLanguage();
  const [registerPayment, { isLoading }] = useRegisterPaymentMutation();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentTime, setPaymentTime] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [allowExceed, setAllowExceed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Reinicia el formulario al abrir; la hora queda con la hora actual.
  useEffect(() => {
    if (!open) return;
    setAmount("");
    setPaymentDate("");
    setPaymentTime(new Date().toTimeString().slice(0, 5));
    setReference("");
    setNotes("");
    setFile(null);
    setReceiptUrl(undefined);
    setAllowExceed(false);
    setErrors({});
    setServerError(null);
  }, [open]);

  const numericAmount = Number(amount);
  const exceedsOutstanding =
    amount !== "" && Number.isFinite(numericAmount) && numericAmount > outstanding;

  const handleFileSelect = async (selected: File | null) => {
    setErrors((prev) => ({ ...prev, receipt: "" }));
    setServerError(null);
    if (!selected) {
      setFile(null);
      setReceiptUrl(undefined);
      return;
    }
    if (!ACCEPTED_RECEIPT_TYPES.includes(selected.type)) {
      setErrors((prev) => ({
        ...prev,
        receipt: t("payouts.registerPayment.errors.fileType"),
      }));
      return;
    }
    setFile(selected);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", selected);
      const res = await fetch("/backend/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const url = data.files?.[0]?.s3Location as string | undefined;
      setReceiptUrl(url);
      if (!url) {
        setErrors((prev) => ({
          ...prev,
          receipt: t("payouts.registerPayment.errors.uploadFailed"),
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        receipt: t("payouts.registerPayment.errors.uploadFailed"),
      }));
    } finally {
      setUploading(false);
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      next.amount = t("payouts.registerPayment.errors.amountRequired");
    } else if (exceedsOutstanding && !allowExceed) {
      next.amount = t("payouts.registerPayment.errors.amountExceeds");
    }
    if (!paymentDate) next.date = t("payouts.registerPayment.errors.dateRequired");
    // El pago es siempre transferencia bancaria: la referencia es obligatoria.
    if (!reference.trim()) {
      next.reference = t("payouts.registerPayment.errors.referenceRequired");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (!validate()) return;
    try {
      await registerPayment({
        hostId,
        amount: numericAmount,
        paymentDate,
        paymentTime: paymentTime || undefined,
        transactionReference: reference.trim() || undefined,
        receiptUrl,
        notes: notes.trim() || undefined,
        allowExceed,
      }).unwrap();
      toast.success(t("payouts.registerPayment.toastSuccess"));
      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        t("payouts.registerPayment.toastError");
      setServerError(message);
    }
  };

  const errorClass = (key: string) =>
    errors[key] ? "border-red-500 focus:border-red-500" : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("payouts.registerPayment.title")}</DialogTitle>
          <DialogDescription>
            {t("payouts.registerPayment.host")}: <strong>{hostName}</strong>
            <br />
            {t("payouts.registerPayment.outstandingBalance")}:{" "}
            <strong>
              ${outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </strong>
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="rp-amount">{t("payouts.registerPayment.amount")}</Label>
            <Input
              id="rp-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const raw = e.target.value;
                const cleaned = filterDecimalChars(raw);
                if (cleaned !== raw) {
                  e.target.value = cleaned;
                  setServerError(numericBlockedMessage(t, findBlockedChar(raw, cleaned)));
                }
                setAmount(cleaned);
                setErrors((prev) => ({ ...prev, amount: "" }));
              }}
              placeholder="0.00"
              className={cn("h-9", errorClass("amount"))}
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount}</p>
            )}
            {exceedsOutstanding && !errors.amount && (
              <label className="flex items-start gap-2 pt-1 text-xs text-muted-foreground">
                <Checkbox
                  checked={allowExceed}
                  onCheckedChange={(v) => setAllowExceed(v === true)}
                  className="mt-0.5"
                />
                {t("payouts.registerPayment.allowExceed")}
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rp-date">{t("payouts.registerPayment.paymentDate")}</Label>
            <Input
              id="rp-date"
              type="date"
              value={paymentDate}
              onChange={(e) => {
                setPaymentDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: "" }));
              }}
              className={cn("h-9", errorClass("date"))}
            />
            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rp-time">{t("payouts.registerPayment.paymentTime")}</Label>
            <Input
              id="rp-time"
              type="time"
              value={paymentTime}
              onChange={(e) => setPaymentTime(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="rp-reference">
              {t("payouts.registerPayment.reference")}
            </Label>
            <Input
              id="rp-reference"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                setErrors((prev) => ({ ...prev, reference: "" }));
              }}
              placeholder={t("payouts.registerPayment.referencePlaceholder")}
              className={cn("h-9", errorClass("reference"))}
            />
            {errors.reference && (
              <p className="text-xs text-red-500">{errors.reference}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="rp-file">{t("payouts.registerPayment.receipt")}</Label>
            <Input
              id="rp-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              className="h-9 file:mr-3"
            />
            {errors.receipt && (
              <p className="text-xs text-red-500">{errors.receipt}</p>
            )}
            {file && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {uploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("payouts.registerPayment.uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3" />
                    {file.name} ({(file.size / 1024).toFixed(0)} KB)
                  </>
                )}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="rp-notes">{t("payouts.registerPayment.notes")}</Label>
            <Textarea
              id="rp-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("payouts.registerPayment.notesPlaceholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("payouts.registerPayment.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || uploading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("payouts.registerPayment.saving")}
              </>
            ) : (
              t("payouts.registerPayment.submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
