"use client"

import { TourForm } from "@/components/modules/add-tour";
import { useLanguage } from "@/lib/i18n-context";

export default function AddProductPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">
        {t("dashboard.addProduct.title")}
      </h1>
      <TourForm />
    </div>
  );
}
