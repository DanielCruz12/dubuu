"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminStatusSwitch } from "../(components)/admin-status-switch";
import { AdminDeleteCell } from "../(components)/admin-delete-cell";
import { isRentalProduct } from "@/utils/product-helpers";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import type { IProduct } from "@/types/product";

/**
 * Columnas de la tabla admin: una sola tabla para tours y rentals,
 * con badge de tipo. El switch de aprobado/publicado es un trigger
 * de true/false directo (admin puede cambiar ambos estados).
 */
export function getAdminProductColumns(
  t: (key: string) => string,
  hostName: string,
  onView: (product: IProduct) => void,
): ColumnDef<IProduct, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: t("dashboard.adminProducts.table.product"),
      cell: ({ row }) => {
        const product = row.original;
        const rental = isRentalProduct(product);
        const image = product.banner || product.images?.[0] || "/tour.jpg";
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={image}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium max-w-[220px]">{product.name}</p>
                <Badge variant={rental ? "secondary" : "outline"}>
                  {rental
                    ? t("dashboard.adminProducts.typeRental")
                    : t("dashboard.adminProducts.typeTours")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {USD_SYMBOL}
                {formatUsd(
                  rental && product.rental?.price_per_day
                    ? product.rental.price_per_day
                    : product.price,
                )}
                {rental ? ` · ${t("dashboard.adminProducts.perDay")}` : ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "host",
      header: t("dashboard.adminProducts.table.host"),
      cell: () => (
        <span className="text-sm text-muted-foreground">{hostName}</span>
      ),
    },
    {
      id: "approved",
      header: t("dashboard.adminProducts.table.approved"),
      cell: ({ row }) => (
        <AdminStatusSwitch product={row.original} field="is_approved" />
      ),
    },
    {
      id: "published",
      header: t("dashboard.adminProducts.table.published"),
      cell: ({ row }) => (
        <AdminStatusSwitch product={row.original} field="is_active" />
      ),
    },
    {
      id: "actions",
      header: t("dashboard.adminProducts.table.actions"),
      meta: { stickyRight: true },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onView(product)}
              aria-label={t("dashboard.adminProducts.table.view")}
              title={t("dashboard.adminProducts.table.view")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t("dashboard.adminProducts.table.edit")}
              title={t("dashboard.adminProducts.table.edit")}
            >
              <Link href={`/dashboard/products/add?edit=${encodeURIComponent(product.id)}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <AdminDeleteCell product={product} />
          </div>
        );
      },
    },
  ];
}
