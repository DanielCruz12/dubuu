"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RentalActionCell } from "../(components)/rental-action-cell";
import type { IRentalProduct } from "@/types/rental";
import { cn } from "@/lib/utils";

const TABLE_CELL_MAX = "max-w-[120px] sm:max-w-[160px] min-w-0";
const TABLE_CELL_TRUNCATE = cn("font-medium truncate", TABLE_CELL_MAX);

export function getRentalColumns(
  t: (key: string) => string,
  refetch?: () => void,
): ColumnDef<IRentalProduct>[] {
  return [
    {
      accessorKey: "name",
      size: 160,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("dashboard.products.rentalTable.name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return (
          <div className={TABLE_CELL_TRUNCATE} title={name}>
            {name}
          </div>
        );
      },
    },
    {
      id: "vehicle",
      header: t("dashboard.products.rentalTable.vehicle"),
      cell: ({ row }) => {
        const r = row.original.rental;
        const text = r ? `${r.brand} ${r.model} (${r.year})` : "—";
        return (
          <div className={TABLE_CELL_TRUNCATE} title={text}>
            {text}
          </div>
        );
      },
    },
    {
      id: "price_per_day",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("dashboard.products.rentalTable.pricePerDay")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const r = row.original.rental;
        const day = r?.price_per_day;
        const base = row.original.price;
        const n = day != null ? Number.parseFloat(String(day)) : Number(base);
        const formatted = new Intl.NumberFormat("es-SV", {
          style: "currency",
          currency: "USD",
        }).format(Number.isFinite(n) ? n : 0);
        return (
          <div className={TABLE_CELL_TRUNCATE} title={formatted}>
            {formatted}
          </div>
        );
      },
    },
    {
      id: "pickup",
      header: t("dashboard.products.rentalTable.pickup"),
      cell: ({ row }) => {
        const text = row.original.rental?.pickup_location ?? "—";
        return (
          <div className={TABLE_CELL_TRUNCATE} title={text}>
            {text}
          </div>
        );
      },
    },
    {
      id: "period",
      header: t("dashboard.products.rentalTable.availability"),
      cell: ({ row }) => {
        const r = row.original.rental;
        const from = r?.available_from ? String(r.available_from).slice(0, 10) : "—";
        const until = r?.available_until ? String(r.available_until).slice(0, 10) : "—";
        const text = `${from} → ${until}`;
        return (
          <div className={TABLE_CELL_TRUNCATE} title={text}>
            {text}
          </div>
        );
      },
    },
    {
      accessorKey: "is_approved",
      header: t("dashboard.products.table.status"),
      cell: ({ row }) => {
        const isActive = row.getValue("is_approved") as boolean;
        const statusLabel = isActive
          ? t("dashboard.products.table.approved")
          : t("dashboard.products.table.pending");
        return (
          <div className={TABLE_CELL_MAX}>
            <Badge
              variant={isActive ? "default" : "destructive"}
              className="max-w-full truncate"
              title={statusLabel}
            >
              {statusLabel}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: t("dashboard.products.rentalTable.listing"),
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean | undefined;
        const visLabel = isActive
          ? t("dashboard.products.table.visible")
          : t("dashboard.products.table.hidden");
        return (
          <div className={TABLE_CELL_MAX}>
            <Badge
              variant={isActive ? "default" : "destructive"}
              className="max-w-full truncate"
              title={visLabel}
            >
              {visLabel}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("dashboard.products.table.actions"),
      meta: { stickyRight: true },
      cell: ({ row }) => <RentalActionCell product={row.original} onDeleted={refetch} />,
    },
  ];
}
