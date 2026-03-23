"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TourForm } from "@/components/modules/add-tour";
import { useLanguage } from "@/lib/i18n-context";
import { Loader2 } from "lucide-react";

function AddProductContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") ?? undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">
          {editId ? t("dashboard.addProduct.editTitle") : t("dashboard.addProduct.title")}
        </h1>
        {editId ? (
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.addProduct.editDescription")}
          </p>
        ) : null}
      </div>
      <TourForm editProductId={editId} />
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      }
    >
      <AddProductContent />
    </Suspense>
  );
}
