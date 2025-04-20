import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Booking {
  id: string;
  tourName: string;
  tourImage: string;
  startDate: string;
  endDate: string;
  status: "confirmado" | "pendiente" | "completado" | "cancelado";
  totalPrice: number;
}

const recentBookings: Booking[] = [
  {
    id: "1",
    tourName: "Tour por la Riviera Maya",
    tourImage:
      "https://images.unsplash.com/photo-1682553064442-8f1c210d65e0?q=80&w=1000&auto=format&fit=crop",
    startDate: "2023-12-15",
    endDate: "2023-12-20",
    status: "confirmado",
    totalPrice: 1220,
  },
  {
    id: "2",
    tourName: "Aventura en los Alpes Suizos",
    tourImage:
      "https://images.unsplash.com/photo-1531210483974-4f8c1f33fd35?q=80&w=1000&auto=format&fit=crop",
    startDate: "2024-01-10",
    endDate: "2024-01-17",
    status: "pendiente",
    totalPrice: 3080,
  },
  {
    id: "5",
    tourName: "Ruta del Vino en La Rioja",
    tourImage:
      "https://images.unsplash.com/photo-1566903026052-36e4e1bd803a?q=80&w=1000&auto=format&fit=crop",
    startDate: "2024-03-15",
    endDate: "2024-03-19",
    status: "confirmado",
    totalPrice: 1500,
  },
  {
    id: "6",
    tourName: "Escapada a Bali",
    tourImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
    startDate: "2024-02-10",
    endDate: "2024-02-18",
    status: "confirmado",
    totalPrice: 1980,
  },
];

export function RecentBookings() {
  return (
    <div className="space-y-8">
      {recentBookings.map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={booking.tourImage || "/placeholder.svg"}
              alt={booking.tourName}
            />
            <AvatarFallback>TD</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {booking.tourName}
            </p>
            <p className="text-sm text-muted-foreground">{booking.startDate}</p>
          </div>
          <div className="ml-auto font-medium">{booking.totalPrice}</div>
        </div>
      ))}
      <Button asChild variant="outline" className="w-full">
        <Link href="/dashboard/reservas">Ver todas las reservas</Link>
      </Button>
    </div>
  );
}
