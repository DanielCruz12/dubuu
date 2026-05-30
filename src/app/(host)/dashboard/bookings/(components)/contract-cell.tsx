"use client";

import { FileDown, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HostBooking } from "@/types/booking";
import type { ChecklistType } from "@/types/contract";
import {
  useGetContractByBookingIdQuery,
  useCreateContractMutation,
} from "@/redux/slices/contract/contract-slice";
import { downloadContractPdf } from "@/lib/contract-pdf";
import { toast } from "sonner";

interface ContractCellProps {
  booking: HostBooking;
  onOpenChecklist: (bookingId: string, contractId: string, type: ChecklistType) => void;
}

export function ContractCell({ booking, onOpenChecklist }: ContractCellProps) {
  const { data: contract } = useGetContractByBookingIdQuery(booking.bookingId);
  const [createContract, { isLoading: isCreating }] = useCreateContractMutation();

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
        toast("Error", { description: "No se pudo crear el contrato." });
        return;
      }
    } else {
      contractId = contract.id;
    }
    onOpenChecklist(booking.bookingId, contractId, type);
  };

  const isRental = booking.booking_kind === "rental";
  if (!isRental) return <span className="text-muted-foreground text-xs">—</span>;

  const status = contract?.status;
  const hasOut = contract?.checklists?.some((c) => c.type === "OUT");
  const hasIn = contract?.checklists?.some((c) => c.type === "IN");

  return (
    <div className="flex flex-col gap-1 py-0.5">
      {/* Completed: only show final download */}
      {hasIn ? (
        <Button
          size="sm"
          className="h-7 px-2 text-xs justify-start bg-green-600 hover:bg-green-700 text-white"
          onClick={handleDownloadPdf}
        >
          <FileDown className="h-3 w-3 mr-1 shrink-0" />
          Descargar Contrato
        </Button>
      ) : (
        <>
          {/* Active: OUT checklist exists, show download + IN register */}
          {hasOut ? (
            <>
              <Button
                size="sm"
                className="h-7 px-2 text-xs justify-start bg-green-600 hover:bg-green-700 text-white"
                onClick={handleDownloadPdf}
              >
                <FileDown className="h-3 w-3 mr-1 shrink-0" />
                Descargar Salida
              </Button>
              {status === "active" && (
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs bg-amber-500 hover:bg-amber-600 text-white justify-start"
                  onClick={() => handleChecklist("IN")}
                >
                  <ClipboardCheck className="h-3 w-3 mr-1 shrink-0" />
                  Registrar Devolución
                </Button>
              )}
            </>
          ) : (
            /* Pending: no contract yet, show create OUT */
            (!status || status === "pending_delivery") && (
              <Button
                size="sm"
                className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white justify-start"
                onClick={() => handleChecklist("OUT")}
                disabled={isCreating}
              >
                <ClipboardCheck className="h-3 w-3 mr-1 shrink-0" />
                {isCreating ? "Creando..." : "Registrar Salida"}
              </Button>
            )
          )}
        </>
      )}
    </div>
  );
}
