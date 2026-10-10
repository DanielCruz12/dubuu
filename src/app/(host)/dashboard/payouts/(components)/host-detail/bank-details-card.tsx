"use client";

import { useState } from "react";
import { Copy, Check, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";
import { useGetHostBankDetailsQuery } from "@/redux/slices/payout/payout-slice";

interface Props {
  hostId: string;
}

/** Enmascara un número de cuenta: solo muestra los últimos 4 dígitos. */
function maskAccount(account: string): string {
  const cleaned = account.replace(/\s+/g, "");
  if (cleaned.length <= 4) return cleaned;
  return `${"*".repeat(Math.max(4, cleaned.length - 4))} ${cleaned.slice(-4)}`;
}

export function BankDetailsCard({ hostId }: Props) {
  const { t } = useLanguage();
  const { data, isLoading } = useGetHostBankDetailsQuery(hostId);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // clipboard no disponible
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  const hasData = Boolean(
    data?.bankName ||
    data?.accountNumber ||
    data?.accountType ||
    data?.holderName,
  );

  const rows: { key: string; label: string; value: string; masked?: boolean }[] = [
    { key: "bank", label: t("payouts.bankDetails.bank"), value: data?.bankName ?? "" },
    { key: "accountType", label: t("payouts.bankDetails.accountType"), value: data?.accountType ?? "" },
    {
      key: "accountNumber",
      label: t("payouts.bankDetails.accountNumber"),
      value: data?.accountNumber ?? "",
      masked: true,
    },
    { key: "holderName", label: t("payouts.bankDetails.accountHolder"), value: data?.holderName ?? "" },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Landmark className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{t("payouts.bankDetails.title")}</h3>
        </div>

        {!hasData ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("payouts.bankDetails.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="text-sm font-medium break-all">
                    {row.masked ? maskAccount(row.value) : row.value || "—"}
                  </p>
                </div>
                {row.value && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={() => copy(row.key, row.value)}
                    aria-label={t("payouts.bankDetails.copy")}
                  >
                    {copiedKey === row.key ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            ))}
            {data?.lastUpdated && (
              <p className="text-xs text-muted-foreground">
                {t("payouts.bankDetails.lastUpdated")}:{" "}
                {new Date(data.lastUpdated).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/*   <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-xs leading-relaxed">{t("payouts.bankDetails.verifyAlert")}</p>
      </div> */}
    </div>
  );
}
