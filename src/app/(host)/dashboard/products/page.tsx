import { DashboardTitle } from "@/components/dashboard-title";
import { ProductsDataTable } from "./(components)/products-table";

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
