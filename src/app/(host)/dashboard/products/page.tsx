"use client"
import { DashboardTitle } from "@/components/dashboard-title";
import { ProductsDataTable } from "./(components)/products-table";
import { useLanguage } from "@/lib/i18n-context";

const Products = () => {
  const { t } = useLanguage();

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading={t("dashboard.products.title")}
        description={t("dashboard.products.description")}
      />
      <ProductsDataTable />
    </div>
  );
};

export default Products;
