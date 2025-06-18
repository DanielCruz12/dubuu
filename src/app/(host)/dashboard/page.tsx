import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, CreditCard, MapPin, Users } from "lucide-react";
import { Overview } from "./(components)/overview";
import { RecentBookings } from "./(components)/recent-bookings";
import { DashboardTitle } from "@/components/dashboard-title";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Control",
  description: "Bienvenido a tu panel de control",
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 px-3 md:px-0">
      <DashboardTitle
        heading="Panel"
        description="Bienvenido a tu panel de control"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Activas
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$150</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el año pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Destinos Visitados
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 desde el año pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Viajeros Frecuentes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Personas en tu grupo habitual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad de Reservas</CardTitle>
            <CardDescription>
              Tus reservas durante los últimos 12 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
            <CardDescription>Tienes 4 reservas pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentBookings />
          </CardContent>
        </Card>

        {/*   <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Resumen de Asistencia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">
                  Total de Reservas
                </div>
                <div className="text-3xl font-bold">{bookings.length}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">
                  Total de Asistentes
                </div>
                <div className="text-3xl font-bold">
                  {bookings.reduce((sum, booking) => sum + booking.tickets, 0)}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">
                  Ingresos Totales
                </div>
                <div className="text-3xl font-bold">
                  $
                  {bookings
                    .reduce(
                      (sum, booking) => sum + Number.parseFloat(booking.total),
                      0
                    )
                    .toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
