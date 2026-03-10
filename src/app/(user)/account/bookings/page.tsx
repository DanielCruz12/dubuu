"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import moment from "moment";
import type { IBookingUser } from "@/types/booking";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookingCard } from "./(components)/booking-card";
import { BookingDetails } from "./(components)/booking-details";
import { DashboardTitle } from "@/components/dashboard-title";
import { useGetBookingsByUserIdQuery } from "@/redux/slices/booking/booking-slice";
import { useUser } from "@clerk/nextjs";

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<IBookingUser | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const { user } = useUser();
  const userId = user?.id as string;

  const { data: bookings = [], isLoading } = useGetBookingsByUserIdQuery(
    userId,
    {
      skip: !userId,
    }
  );

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const mapStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "completado",
      confirmed: "confirmado",
      pending: "pendiente",
      cancelled: "cancelado",
    };
    return statusMap[status] || status;
  };

  const filteredBookings = bookings.filter((booking: IBookingUser) => {
    // Apply search filter
    const matchesSearch =
      booking.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${booking.product_address}, ${booking.country}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Apply status filter if any are selected
    const uiStatus = mapStatus(booking.status);
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(uiStatus);

    return matchesSearch && matchesStatus;
  });

  const todayStart = moment().startOf("day");

  const upcomingBookings = filteredBookings.filter((booking: IBookingUser) => {
    const tourDate = moment(booking.tourDate);
    return tourDate.isSameOrAfter(todayStart);
  });

  const pastBookings = filteredBookings.filter((booking: IBookingUser) => {
    const tourDate = moment(booking.tourDate);
    return tourDate.isBefore(todayStart);
  });

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle heading="Reservas" description="Gestiona tus reservas" />
      <div className="flex flex-col sm:flex-row gap-3 mb-6 px-1 pt-7 items-start">
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
            {isLoading ? (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">Cargando reservas...</p>
              </div>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking: IBookingUser) => (
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
            {isLoading ? (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">Cargando reservas...</p>
              </div>
            ) : pastBookings.length > 0 ? (
              pastBookings.map((booking: IBookingUser) => (
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
