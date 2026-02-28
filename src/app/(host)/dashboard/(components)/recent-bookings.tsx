"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PanelUpcomingReservations } from "@/types/panel";

interface RecentBookingsProps {
  data?: PanelUpcomingReservations | null;
  viewAllLabel: string;
  getStatusLabel: (status: string) => string;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function RecentBookings({
  data,
  viewAllLabel,
  getStatusLabel,
}: RecentBookingsProps) {
  const reservations = data?.reservations ?? [];

  return (
    <div className="space-y-8">
      {reservations.map((res) => (
        <div key={res.id} className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage
              src={res.productBanner || "/logo.svg"}
              alt={res.productName}
            />
            <AvatarFallback>
              {res.productName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {res.productName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(res.date)} · {getStatusLabel(res.status)}
            </p>
            {res.guestName && (
              <p className="text-xs text-muted-foreground">{res.guestName}</p>
            )}
          </div>
          <div className="ml-auto shrink-0 font-medium">
            ${Number.parseFloat(res.total).toFixed(2)}
          </div>
        </div>
      ))}
      <Button asChild variant="outline" className="w-full">
        <Link href="/dashboard/reservas">{viewAllLabel}</Link>
      </Button>
    </div>
  );
}
