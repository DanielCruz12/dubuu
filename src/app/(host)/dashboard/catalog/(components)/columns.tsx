"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type {
  IProductTypes,
  IProductCategory,
  IProductAmenity,
  IProductAudience,
} from "@/types/product";
import { ActionCell } from "./action-cell";
import { CategoryActionCell } from "./category-action-cell";
import { AmenityActionCell } from "./amenity-action-cell";
import { AudienceActionCell } from "./audience-action-cell";
import { useLanguage } from "@/lib/i18n-context";

export function useProductTypeColumns(
  onEdit: (item: IProductTypes) => void,
  onDeleted: () => void
): ColumnDef<IProductTypes>[] {
  const { t } = useLanguage();

  return [
    {
      accessorKey: "name",
      header: t("catalog.table.name"),
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: t("catalog.table.description"),
      enableSorting: false,
    },
    {
      id: "actions",
      header: t("catalog.table.actions"),
      cell: ({ row }) => (
        <ActionCell
          productType={row.original}
          onEdit={onEdit}
          onDeleted={onDeleted}
        />
      ),
      meta: { stickyRight: true },
      enableSorting: false,
    },
  ];
}

export function useCategoryColumns(
  onDeleted: () => void
): ColumnDef<IProductCategory>[] {
  const { t } = useLanguage();

  return [
    {
      accessorKey: "name",
      header: t("catalog.table.name"),
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: t("catalog.table.description"),
      enableSorting: false,
    },
    {
      id: "productType",
      header: t("catalog.table.productType"),
      accessorFn: (row) => row.product_type?.name ?? "-",
      enableSorting: false,
    },
    {
      id: "actions",
      header: t("catalog.table.actions"),
      cell: ({ row }) => (
        <CategoryActionCell
          category={row.original}
          onDeleted={onDeleted}
        />
      ),
      meta: { stickyRight: true },
      enableSorting: false,
    },
  ];
}

export function useAmenityColumns(
  onDeleted: () => void
): ColumnDef<IProductAmenity>[] {
  const { t } = useLanguage();

  return [
    {
      accessorKey: "name",
      header: t("catalog.table.name"),
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: t("catalog.table.description"),
      enableSorting: false,
    },
    {
      id: "category",
      header: t("catalog.form.category"),
      accessorFn: (row) =>
        typeof row.category_id === "object"
          ? row.category_id.name
          : row.category_id ?? "-",
      enableSorting: false,
    },
    {
      id: "actions",
      header: t("catalog.table.actions"),
      cell: ({ row }) => (
        <AmenityActionCell amenity={row.original} onDeleted={onDeleted} />
      ),
      meta: { stickyRight: true },
      enableSorting: false,
    },
  ];
}

export function useAudienceColumns(
  onDeleted: () => void
): ColumnDef<IProductAudience>[] {
  const { t } = useLanguage();

  return [
    {
      accessorKey: "name",
      header: t("catalog.table.name"),
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: t("catalog.table.description"),
      enableSorting: false,
    },
    {
      id: "actions",
      header: t("catalog.table.actions"),
      cell: ({ row }) => (
        <AudienceActionCell audience={row.original} onDeleted={onDeleted} />
      ),
      meta: { stickyRight: true },
      enableSorting: false,
    },
  ];
}
