"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RentalActionCell } from "../(components)/rental-action-cell";
import { RentalActiveCell } from "../(components)/rental-active-cell";
import type { IRentalProduct } from "@/types/rental";
import { cn } from "@/lib/utils";

const TABLE_CELL_MAX = "max-w-[120px] sm:max-w-[160px] min-w-0";
const TABLE_CELL_NARROW = "max-w-[72px] sm:max-w-[88px] min-w-0";
const TABLE_CELL_TRUNCATE = cn("font-medium truncate", TABLE_CELL_MAX);

type TKey = (key: string) => string;

export function getRentalColumns(
  t: TKey,
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
      id: "brand",
      header: t("dashboard.products.rentalTable.brand"),
      cell: ({ row }) => {
        const text = row.original.rental?.brand ?? "—";
        return (
          <div className={TABLE_CELL_TRUNCATE} title={text}>
            {text}
          </div>
        );
      },
    },
    {
      id: "model",
      header: t("dashboard.products.rentalTable.model"),
      cell: ({ row }) => {
        const text = row.original.rental?.model ?? "—";
        return (
          <div className={TABLE_CELL_TRUNCATE} title={text}>
            {text}
          </div>
        );
      },
    },
    {
      id: "year",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("dashboard.products.rentalTable.year")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.rental?.year ?? 0,
      cell: ({ row }) => {
        const y = row.original.rental?.year;
        const text = y != null ? String(y) : "—";
        return (
          <div
            className={cn("font-medium tabular-nums", TABLE_CELL_NARROW)}
            title={text}
          >
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
      id: "is_active",
      header: t("dashboard.products.rentalTable.active"),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <RentalActiveCell product={row.original} />
        </div>
      ),
    },
    {
      accessorKey: "is_approved",
      header: t("dashboard.products.table.status"),
      cell: ({ row }) => {
        const isApproved = row.getValue("is_approved") as boolean;
        const statusLabel = isApproved
          ? t("dashboard.products.table.approved")
          : t("dashboard.products.table.pending");
        return (
          <div className={TABLE_CELL_MAX}>
            <Badge
              variant={isApproved ? "outline" : "destructive"}
              className={cn(
                "max-w-full truncate",
                isApproved &&
                  "text-green-700 border-green-200 dark:text-green-400 dark:border-green-800",
              )}
              title={statusLabel}
            >
              {statusLabel}
            </Badge>
          </div>
        );
      },
    },

    {
      id: "actions",
      header: t("dashboard.products.table.actions"),
      meta: { stickyRight: true },
      cell: ({ row }) => (
        <RentalActionCell product={row.original} onDeleted={refetch} />
      ),
    },
  ];
}
