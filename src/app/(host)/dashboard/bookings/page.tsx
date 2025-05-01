"use client";

import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingsDataTable } from "./(components)/bookings-table";
import { DashboardTitle } from "@/components/dashboard-title";

export default function BookingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-8 w-[200px] mb-6 animation-pulse" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">
          Please sign in to view your bookings
        </h1>
      </div>
    );
  }

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Reservas"
        description="Lista de todas tus reservas"
      />
      <BookingsDataTable userId={user.id} />
    </div>
  );
}
