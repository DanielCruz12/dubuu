"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Download, CheckCircle, Star, ChevronRight, Loader2 } from "lucide-react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function TourReceipt() {
  const [isLoading, setIsLoading] = useState(false)

  // Sample data - replace with your actual data
  const receipt = {
    companyName: "TourExplorer",
    logo: "/placeholder.svg?height=40&width=120",
    bookingNumber: "TE123456",
    bookingDate: "23 Abr 2023 • 9:24 AM",
    customerName: "Carlos Rodríguez",
    customerEmail: "carlos.rodriguez@email.com",
    customerPhone: "+34 612 345 678",
    tourName: "Tour del Casco Histórico",
    tourImage: "/tour1.jpg",
    tourDate: "15 May 2023",
    tourTime: "09:00 - 13:00",
    meetingPoint: "Plaza Mayor, Centro",
    participants: 2,
    basePrice: 45.0,
    taxRate: 18,
    taxAmount: 16.2,
    discount: 10.0,
    totalAmount: 90.0,
    paymentMethod: "Tarjeta de Crédito",
    paymentStatus: "Pagado",
    billingAddress: {
      street: "Calle Principal 123",
      city: "Madrid",
      state: "Madrid",
      zip: "28001",
      country: "España",
    },
    confirmationCode: "TOUR-XYZ123",
  }

  const downloadAsPDF = async () => {
    setIsLoading(true)

    try {
      // Ocultar los botones durante la generación del PDF
      const buttons = document.querySelectorAll(".hide-for-pdf")
      buttons.forEach((button) => {
        button.classList.add("hidden")
      })

      // Importar las bibliotecas necesarias
      const jsPDFModule = await import("jspdf")
      const html2canvasModule = await import("html2canvas")

      const jsPDF = jsPDFModule.default
      const html2canvas = html2canvasModule.default

      // Obtener el elemento a convertir
      const element = document.getElementById("receipt-container")

      if (!element) {
        throw new Error("No se encontró el elemento del recibo")
      }

      // Crear el canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      // Crear el PDF
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      })

      // Añadir la imagen del canvas al PDF
      const imgData = canvas.toDataURL("image/jpeg", 1.0)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)

      // Guardar el PDF
      pdf.save(`Recibo-${receipt.bookingNumber}.pdf`)

      toast({
        title: "PDF descargado correctamente",
        description: "Tu recibo ha sido descargado como PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error al descargar",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      // Mostrar los botones nuevamente
      const buttons = document.querySelectorAll(".hide-for-pdf")
      buttons.forEach((button) => {
        button.classList.remove("hidden")
      })

      setIsLoading(false)
    }
  }

  // Crear URL para el QR code
  const qrCodeValue = `https://tourexplorer.com/reservas/${receipt.bookingNumber}?code=${receipt.confirmationCode}`

  return (
    <div className="min-h-screen py-8 px-4 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Action Buttons */}
        <div className="flex justify-end mb-4 gap-3 hide-for-pdf">
          <Button
            onClick={downloadAsPDF}
            className="bg-[#4F46E5] hover:bg-[#4338CA] flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Descargar Factura
              </>
            )}
          </Button>
        </div>

        {/* Receipt Container */}
        <div id="receipt-container" className=" shadow-md mx-auto overflow-hidden rounded-xl">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center">
                  <div className="bg-[#4F46E5]  p-2 rounded-lg mr-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 5L21 9L12 13L3 9Z" fill="white" />
                      <path
                        d="M3 14L12 18L21 14"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold">{receipt.companyName}</h1>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1 font-normal">
                    <CheckCircle className="h-3 w-3" /> Reserva Confirmada
                  </Badge>
                </div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">¡Gracias por tu reserva!</h2>
              <p className="text-gray-600">
                Hola {receipt.customerName}, gracias por reservar con {receipt.companyName}. Tu reserva ha sido
                confirmada y te esperamos para disfrutar de una experiencia inolvidable.
              </p>
            </div>

            {/* Order Details */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Detalles de la Reserva</h3>
                <Button variant="link" className="text-[#4F46E5] p-0 h-auto flex items-center hide-for-pdf">
                  Ver Detalles <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 flex items-center">
                  <div className="mr-4 flex-shrink-0">
                    <Image
                      src={receipt.tourImage || "/placeholder.svg"}
                      alt={receipt.tourName}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-lg">{receipt.tourName}</h4>
                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1 text-gray-400" />
                        {receipt.tourDate}, {receipt.tourTime}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 px-2 text-gray-400" />
                        {receipt.meetingPoint}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Participantes:</span> {receipt.participants} personas
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-lg">€{receipt.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info and QR Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3">Información de la Reserva</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Nº de Reserva</div>
                    <div className="font-medium">#{receipt.bookingNumber}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Fecha de Reserva</div>
                    <div className="font-medium">{receipt.bookingDate}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Método de Pago</div>
                    <div className="font-medium">{receipt.paymentMethod}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Estado</div>
                    <div className="font-medium text-green-600">{receipt.paymentStatus}</div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3 mt-6">Dirección de Facturación</h3>
                <div className="text-sm">
                  <p className="mb-1">{receipt.customerName}</p>
                  <p className="mb-1">{receipt.billingAddress.street}</p>
                  <p className="mb-1">
                    {receipt.billingAddress.city}, {receipt.billingAddress.state} {receipt.billingAddress.zip}
                  </p>
                  <p>{receipt.billingAddress.country}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3">Código de Confirmación</h3>
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="mb-3">
                    <QRCodeSVG
                      value={qrCodeValue}
                      size={150}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Escanea este código</p>
                    <p className="text-lg font-bold tracking-wider">{receipt.confirmationCode}</p>
                    <p className="text-xs text-gray-500 mt-1">Presenta este código al guía el día del tour</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Resumen de Facturación</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Precio base</span>
                      <span>€{(receipt.basePrice * receipt.participants).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA @ {receipt.taxRate}%</span>
                      <span>€{receipt.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descuento</span>
                      <span className="text-green-600">-€{receipt.discount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Pagado</span>
                        <span>€{receipt.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotional Banner */}
            <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg overflow-hidden">
              <div className="p-6 flex justify-between items-center">
                <div className="">
                  <h3 className="text-xl font-bold mb-1">¡OFERTA ESPECIAL!</h3>
                  <p className="text-indigo-100">Reserva tu próximo tour con 20% de descuento</p>
                </div>
                <Button className=" text-indigo-600 hover:bg-indigo-50 hide-for-pdf">Ver Ofertas</Button>
              </div>
            </div>

            {/* Rate Experience */}
            <div className="mb-8 hide-for-pdf">
              <h3 className="text-lg font-semibold mb-4">Valora tu Experiencia de Reserva</h3>
              <div className="flex justify-center">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-8 w-8 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-gray-500">
                    ¿Necesitas ayuda? Contáctanos en{" "}
                    <a href="mailto:info@tourexplorer.com" className="text-[#4F46E5]">
                      info@tourexplorer.com
                    </a>
                  </p>
                </div>
                <div className="flex gap-4 hide-for-pdf">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                    <span className="sr-only">Twitter</span>
                  </Button>
                </div>
              </div>
              <div className="text-center text-xs text-gray-400 mt-6">
                © 2023 TourExplorer. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
