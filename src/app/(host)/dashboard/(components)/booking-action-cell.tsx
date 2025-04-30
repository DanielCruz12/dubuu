/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { MoreHorizontal, FileText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IBooking } from "@/types/booking";
import { toast } from "sonner";

interface BookingActionCellProps {
  booking: IBooking;
  onUpdate?: (updatedBooking: Partial<IBooking>) => void;
}

export function BookingActionCell({ booking }: BookingActionCellProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.id);
    toast("ID Copied", {
      description: "The booking ID has been copied to your clipboard.",
    });
  };

  const handleViewDetails = () => {
    setShowDetails(true);
    // Aquí podrías implementar la lógica para mostrar detalles
    console.log("View details for booking:", booking.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleViewDetails}>
            <FileText className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Aquí podrías añadir un modal para mostrar detalles de la reserva */}
    </>
  );
}
