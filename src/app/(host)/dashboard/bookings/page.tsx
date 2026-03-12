"use client";

import { BookingsDataTable } from "./(components)/bookings-table";
import { DashboardTitle } from "@/components/dashboard-title";
import { useLanguage } from "@/lib/i18n-context";

export default function BookingsPage() {
  const { t } = useLanguage();

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading={t("dashboard.bookings.title")}
        description={t("dashboard.bookings.description")}
      />
      <BookingsDataTable />
    </div>
  );
}
