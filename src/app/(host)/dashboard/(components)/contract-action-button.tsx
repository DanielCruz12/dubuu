"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Copy,
  ClipboardCheck,
  FileDown,
  Car,
  Flag,
  AlertTriangle,
} from "lucide-react";
import type { HostBooking } from "@/types/booking";
import type { ChecklistType } from "@/types/contract";
import { toast } from "sonner";
import {
  useGetContractByBookingIdQuery,
  useCreateContractMutation,
} from "@/redux/slices/contract/contract-slice";
import { downloadContractPdf } from "@/lib/contract-pdf";
import { useLanguage } from "@/lib/i18n-context";

interface ContractActionButtonProps {
  booking: HostBooking;
  onOpenChecklist: (bookingId: string, contractId: string, type: ChecklistType) => void;
}

export function ContractActionButton({
  booking,
  onOpenChecklist,
}: ContractActionButtonProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const { data: contract } =
    useGetContractByBookingIdQuery(booking.bookingId);

  const [createContract, { isLoading: isCreating }] =
    useCreateContractMutation();

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.bookingId);
    toast(t("dashboard.contractActions.idCopied"), {
      description: t("dashboard.contractActions.idCopiedDesc"),
    });
  };

  const handleDownloadPdf = () => {
    if (!contract) return;
    downloadContractPdf(contract);
  };

  const handleChecklist = async (type: ChecklistType) => {
    let contractId: string;

    if (!contract) {
      try {
        const created = await createContract(booking.bookingId).unwrap();
        contractId = created.id;
      } catch {
        toast(t("dashboard.contractActions.error"), {
          description: t("dashboard.contractActions.createError"),
        });
        return;
      }
    } else {
      contractId = contract.id;
    }

    onOpenChecklist(booking.bookingId, contractId, type);
  };

  const isRental = booking.booking_kind === "rental";
  if (!isRental) return null;

  const status = contract?.status;
  const hasOut = contract?.checklists?.some((c) => c.type === "OUT");
  const hasIn = contract?.checklists?.some((c) => c.type === "IN");

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("dashboard.contractActions.openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t("dashboard.contractActions.title")}</DropdownMenuLabel>

          {(!status || status === "pending_delivery") && (
            <DropdownMenuItem
              onClick={() => handleChecklist("OUT")}
              disabled={isCreating}
            >
              <ClipboardCheck className="mr-2 h-4 w-4 text-blue-600" />
              {isCreating
                ? t("dashboard.contractActions.creatingContract")
                : t("dashboard.contractActions.registerOut")}
            </DropdownMenuItem>
          )}

          {status === "active" && (
            <DropdownMenuItem onClick={() => handleChecklist("IN")}>
              <Flag className="mr-2 h-4 w-4 text-amber-500" />
              {t("dashboard.contractActions.registerIn")}
            </DropdownMenuItem>
          )}

          {status === "disputed" && (
            <DropdownMenuItem disabled>
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
              {t("dashboard.contractActions.disputed")}
            </DropdownMenuItem>
          )}

          {/* PDF downloads — available whenever checklists exist */}
          {hasOut && (
            <DropdownMenuItem onClick={handleDownloadPdf}>
              <FileDown className="mr-2 h-4 w-4 text-blue-600" />
              {t("dashboard.contractActions.downloadOut")}
            </DropdownMenuItem>
          )}

          {hasIn && (
            <DropdownMenuItem onClick={handleDownloadPdf}>
              <FileDown className="mr-2 h-4 w-4 text-green-600" />
              {t("dashboard.contractActions.downloadFinal")}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            {t("dashboard.contractActions.copyId")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile-first inline action buttons */}
      <div className="mt-2 flex flex-col gap-1.5 sm:hidden">
        {(!status || status === "pending_delivery") && (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full justify-start"
            onClick={() => handleChecklist("OUT")}
            disabled={isCreating}
          >
            <Car className="mr-2 h-4 w-4" />
            {isCreating
              ? t("dashboard.contractActions.creating")
              : t("dashboard.contractActions.registerOut")}
          </Button>
        )}

        {status === "active" && (
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white w-full justify-start"
            onClick={() => handleChecklist("IN")}
          >
            <Flag className="mr-2 h-4 w-4" />
            {t("dashboard.contractActions.registerIn")}
          </Button>
        )}

        {status === "disputed" && (
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start text-amber-600 border-amber-300"
            disabled
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {t("dashboard.contractActions.disputed")}
          </Button>
        )}

        {hasOut && (
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start"
            onClick={handleDownloadPdf}
          >
            <FileDown className="mr-2 h-3.5 w-3.5" />
            {t("dashboard.contractActions.downloadOut")}
          </Button>
        )}

        {hasIn && (
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start"
            onClick={handleDownloadPdf}
          >
            <FileDown className="mr-2 h-3.5 w-3.5" />
            {t("dashboard.contractActions.downloadFinal")}
          </Button>
        )}
      </div>
    </>
  );
}
