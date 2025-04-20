import { DashboardTitle } from "@/components/dashboard-title";
import React from "react";
import { BookingsDataTable } from "./(components)/bookings-table";

const Bookings = () => {
  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Reservas"
        description="Gestiona las reservas de tus clientes"
      />
      <BookingsDataTable />
    </div>
  );
};

export default Bookings;
