/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import type { Booking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookingCard } from "./(components)/booking-card";
import { bookings } from "@/utils/data";
import { BookingDetails } from "./(components)/booking-details";
import { DashboardTitle } from "@/components/dashboard-title";

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filteredBookings = bookings.filter((booking: any) => {
    // Apply search filter
    const matchesSearch =
      booking.tourName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter if any are selected
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(booking.status);

    return matchesSearch && matchesStatus;
  });

  const upcomingBookings = filteredBookings.filter(
    (booking: any) =>
      booking.status === "confirmado" || booking.status === "pendiente"
  );
  const pastBookings = filteredBookings.filter(
    (booking: any) =>
      booking.status === "completado" || booking.status === "cancelado"
  );

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle heading="Reservas" description="Gestiona tus reservas" />
      <div className="flex flex-col sm:flex-row gap-3 mb-6 pt-7 items-start">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar reservas..."
            className="pl-10 bg-background border-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            {["confirmado", "pendiente", "completado", "cancelado"].map(
              (status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => handleStatusFilterChange(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6 bg-background border-b w-full justify-start rounded-none h-auto p-0 space-x-8">
          <TabsTrigger
            value="upcoming"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
          >
            Próximas
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
          >
            Anteriores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking: any) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => setSelectedBooking(booking)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">
                  No tienes reservas próximas
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking: any) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => setSelectedBooking(booking)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">
                  No tienes reservas anteriores
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
