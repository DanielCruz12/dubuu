import { DashboardTitle } from "@/components/dashboard-title";
import { ProductsDataTable } from "./(components)/products-table";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Productos",
  description: "Lista de todos tus productos",
};

const Products = () => {
  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Productos"
        description="Lista de todos tus productos"
      />
      <ProductsDataTable />
    </div>
  );
};

export default Products;
