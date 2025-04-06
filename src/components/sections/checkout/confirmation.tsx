import Link from "next/link"
import { CheckCircle, ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-10 px-4 md:px-6">
      <div className="container mx-auto max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-slate-50 to-slate-100 pb-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">¡Pedido Confirmado!</CardTitle>
            <CardDescription>Gracias por tu compra. Tu pedido ha sido recibido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Número de Pedido:</span>
                <span className="font-medium">#ORD-12345</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">$149.96</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-5 w-5 text-slate-500" />
                <h3 className="font-medium">Información de Envío</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Tu pedido será enviado a la dirección proporcionada.</p>
              <p className="text-sm text-muted-foreground">Tiempo estimado de entrega: 3-5 días hábiles.</p>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Se ha enviado un correo de confirmación a tu dirección de email.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 bg-gradient-to-r from-slate-50 to-slate-100 pt-6">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 transition-all duration-300"
            >
              <Link href="/orders">Ver Pedido</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Continuar Comprando</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

