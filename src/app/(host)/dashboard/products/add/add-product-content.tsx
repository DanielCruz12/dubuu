"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { TourForm } from "@/components/modules/add-tour";
import { RentalForm } from "@/components/modules/add-rental";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import { useGetProductTypesQuery } from "@/redux/slices/product/product-types";
import { useLanguage } from "@/lib/i18n-context";
import { isProductType, productTypeNameToFormKind } from "@/utils";

function EditProductLoader({ editId }: { editId: string }) {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useGetProductQuery(editId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">{t("dashboard.addProduct.loadingEdit")}</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-destructive py-16 text-sm">{t("dashboard.addProduct.loadError")}</div>
    );
  }

  if (isProductType(data, "tours")) {
    return <TourForm editProductId={editId} />;
  }

  if (isProductType(data, "rental")) {
    return <RentalForm editProductId={editId} />;
  }

  return (
    <div className="text-center text-muted-foreground py-16 text-sm">{t("dashboard.addProduct.unsupportedType")}</div>
  );
}

function CreateProductByType({ typeId }: { typeId: string }) {
  const { t } = useLanguage();
  const { data: productTypes = [], isLoading } = useGetProductTypesQuery();

  const kind = useMemo(() => {
    const pt = productTypes.find((p) => p.id === typeId);
    return pt ? productTypeNameToFormKind(pt.name) : null;
  }, [typeId, productTypes]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">{t("dashboard.addProductType.loadingTypes")}</p>
      </div>
    );
  }

  if (!kind) {
    return (
      <div className="text-center text-destructive py-16 text-sm">{t("dashboard.addProductType.invalidTypeParam")}</div>
    );
  }

  if (kind === "tours") {
    return <TourForm productTypeId={typeId} />;
  }

  return <RentalForm productTypeId={typeId} />;
}

export function AddProductContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") ?? undefined;
  const typeId = searchParams.get("type") ?? undefined;

  useEffect(() => {
    if (editId || typeId) return;
    router.replace("/dashboard/products");
  }, [editId, typeId, router]);

  if (editId) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard.addProduct.editTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboard.addProduct.editDescription")}</p>
        </div>
        <EditProductLoader editId={editId} />
      </div>
    );
  }

  if (typeId) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard.addProduct.title")}</h1>
        </div>
        <CreateProductByType typeId={typeId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">{t("dashboard.addProduct.redirecting")}</p>
    </div>
  );
}
