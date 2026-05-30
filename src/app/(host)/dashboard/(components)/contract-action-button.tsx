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

interface ContractActionButtonProps {
  booking: HostBooking;
  onOpenChecklist: (bookingId: string, contractId: string, type: ChecklistType) => void;
}

export function ContractActionButton({
  booking,
  onOpenChecklist,
}: ContractActionButtonProps) {
  const [open, setOpen] = useState(false);

  const { data: contract } =
    useGetContractByBookingIdQuery(booking.bookingId);

  const [createContract, { isLoading: isCreating }] =
    useCreateContractMutation();

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.bookingId);
    toast("ID Copiado", {
      description: "El ID de la reserva ha sido copiado.",
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
        toast("Error", {
          description: "No se pudo crear el contrato.",
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
            <span className="sr-only">Abrir menú de acciones</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Acciones del Contrato</DropdownMenuLabel>

          {(!status || status === "pending_delivery") && (
            <DropdownMenuItem
              onClick={() => handleChecklist("OUT")}
              disabled={isCreating}
            >
              <ClipboardCheck className="mr-2 h-4 w-4 text-blue-600" />
              {isCreating ? "Creando contrato..." : "Registrar Entrega (Salida)"}
            </DropdownMenuItem>
          )}

          {status === "active" && (
            <DropdownMenuItem onClick={() => handleChecklist("IN")}>
              <Flag className="mr-2 h-4 w-4 text-amber-500" />
              Registrar Devolución (Entrada)
            </DropdownMenuItem>
          )}

          {status === "disputed" && (
            <DropdownMenuItem disabled>
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
              En Disputa
            </DropdownMenuItem>
          )}

          {/* PDF downloads — available whenever checklists exist */}
          {hasOut && (
            <DropdownMenuItem onClick={handleDownloadPdf}>
              <FileDown className="mr-2 h-4 w-4 text-blue-600" />
              Descargar Contrato de Salida (PDF)
            </DropdownMenuItem>
          )}

          {hasIn && (
            <DropdownMenuItem onClick={handleDownloadPdf}>
              <FileDown className="mr-2 h-4 w-4 text-green-600" />
              Descargar Contrato Final (PDF)
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar ID
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
            {isCreating ? "Creando..." : "Registrar Entrega (Salida)"}
          </Button>
        )}

        {status === "active" && (
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white w-full justify-start"
            onClick={() => handleChecklist("IN")}
          >
            <Flag className="mr-2 h-4 w-4" />
            Registrar Devolución (Entrada)
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
            En Disputa
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
            Descargar Contrato de Salida (PDF)
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
            Descargar Contrato Final (PDF)
          </Button>
        )}
      </div>
    </>
  );
}
