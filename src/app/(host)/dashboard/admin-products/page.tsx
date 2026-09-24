"use client";

import { DashboardTitle } from "@/components/dashboard-title";
import { AdminProductsContent } from "./(components)/admin-products-content";
import { useLanguage } from "@/lib/i18n-context";

const AdminProducts = () => {
  const { t } = useLanguage();

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading={t("dashboard.adminProducts.title")}
        description={t("dashboard.adminProducts.description")}
      />
      <AdminProductsContent />
    </div>
  );
};

export default AdminProducts;
