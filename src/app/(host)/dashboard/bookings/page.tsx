import { BookingsDataTable } from "./(components)/bookings-table";
import { DashboardTitle } from "@/components/dashboard-title";

export default function BookingsPage() {
  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Reservas"
        description="Lista de todas tus reservas"
      />
      <BookingsDataTable />
    </div>
  );
}
