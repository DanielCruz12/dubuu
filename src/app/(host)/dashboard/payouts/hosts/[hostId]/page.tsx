import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Host Payment Details",
  description: "Detalle de pagos del host",
};

/**
 * Placeholder temporal — Fase 4 (Host Payment Details) del panel admin:
 * avatar/datos del host, estadísticas, tabs Overview/History/Bank Details,
 * registro de pagos y comprobantes. Esta página se reemplazará en esa fase.
 */
export default function HostPaymentDetailsPage({
  params,
}: {
  params: { hostId: string };
}) {
  return (
    <div className="p-4 md:p-5 space-y-5 max-w-6xl">
      <Link href="/dashboard/payouts">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Pagos
        </Button>
      </Link>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/50">
          <Wallet className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h1 className="text-lg font-semibold">Host Payment Details</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          El detalle de pagos del host se implementará en la Fase 4 del panel
          de administración. Host: {params.hostId}
        </p>
      </div>
    </div>
  );
}
