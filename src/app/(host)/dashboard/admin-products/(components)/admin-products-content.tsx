"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/datatable";
import { DataTableSkeleton } from "@/components/skeletons/datatable-skeleton";
import { getAdminProductColumns } from "../(columns)/admin-product-columns";
import { AdminProductDetailsModal } from "./admin-product-details-modal";
import {
  useGetProductHostsQuery,
  useGetProductsByUserIdQuery,
} from "@/redux/slices/product/product-slice";
import { useLanguage } from "@/lib/i18n-context";
import type { IProduct } from "@/types/product";

export function AdminProductsContent() {
  const { t } = useLanguage();
  const { data: hostsData, isLoading: isLoadingHosts } =
    useGetProductHostsQuery();
  const hosts = useMemo(() => hostsData?.data ?? [], [hostsData]);

  const [selectedHostId, setSelectedHostId] = useState<string>("");
  const [viewingProduct, setViewingProduct] = useState<IProduct | null>(null);

  // Auto-selecciona el primer host (solo se cargan los productos de ese host).
  useEffect(() => {
    if (!selectedHostId && hosts.length > 0) {
      setSelectedHostId(hosts[0].userId);
    }
  }, [hosts, selectedHostId]);

  const selectedHost = hosts.find((h) => h.userId === selectedHostId) ?? null;

  const {
    data: products,
    isLoading: isLoadingProducts,
  } = useGetProductsByUserIdQuery(selectedHostId, {
    skip: !selectedHostId,
  });

  const columns = useMemo(
    () =>
      getAdminProductColumns(t, selectedHost?.username ?? "", (product) =>
        setViewingProduct(product),
      ),
    [t, selectedHost?.username],
  );

  const approvedCount = useMemo(
    () => (products ?? []).filter((p) => p.is_approved).length,
    [products],
  );
  const publishedCount = useMemo(
    () => (products ?? []).filter((p) => p.is_active).length,
    [products],
  );

  return (
    <div className="space-y-4 pt-6">
      <Card>
        <CardContent className="p-6">
          {/* Filtro por host */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="w-full max-w-md min-w-0">
              <label className="mb-1 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                {t("dashboard.adminProducts.hostFilter.label")}
              </label>
              {isLoadingHosts ? (
                <div className="flex h-10 w-full animate-pulse rounded-md border border-input bg-muted" />
              ) : (
                <Select
                  value={selectedHostId}
                  onValueChange={setSelectedHostId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("dashboard.adminProducts.hostFilter.placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {hosts.map((host) => (
                      <SelectItem key={host.userId} value={host.userId}>
                        {host.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedHost && !isLoadingProducts && (
              <div className="flex flex-wrap gap-2 md:ml-auto">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {t("dashboard.adminProducts.summary.total")}:{" "}
                  {products?.length ?? 0}
                </span>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                  {t("dashboard.adminProducts.summary.approved")}:{" "}
                  {approvedCount}
                </span>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
                  {t("dashboard.adminProducts.summary.published")}:{" "}
                  {publishedCount}
                </span>
              </div>
            )}
          </div>

          {/* Estado vacío sin host seleccionado */}
          {!selectedHostId && !isLoadingHosts ? (
            <div className="mt-6 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              {t("dashboard.adminProducts.hostFilter.empty")}
            </div>
          ) : isLoadingProducts ? (
            <div className="mt-6">
              <DataTableSkeleton
                headers={[
                  t("dashboard.adminProducts.table.product"),
                  t("dashboard.adminProducts.table.host"),
                  t("dashboard.adminProducts.table.approved"),
                  t("dashboard.adminProducts.table.published"),
                  t("dashboard.adminProducts.table.actions"),
                ]}
              />
            </div>
          ) : (
            <div className="mt-6">
              <DataTable
                columns={columns}
                data={products ?? []}
                showSearch={false}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AdminProductDetailsModal
        product={viewingProduct}
        open={viewingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setViewingProduct(null);
        }}
        onDeleted={(id) => {
          if (viewingProduct?.id === id) setViewingProduct(null);
        }}
      />
    </div>
  );
}
