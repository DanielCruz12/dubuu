import React from "react";
import { DashboardTitle } from "../../(components)/dashboard-title";

const MyProductsPage = () => {
  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="lista de productos"
        description="Gestiona tus productos"
      />
    </div>
  );
};

export default MyProductsPage;
