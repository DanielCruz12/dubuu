export type ReceiptItem = {
  id: string
  description: string
  quantity: number
  price: number | string
}

export type ReceiptProps = {
  receiptNumber: string
  date: string
  /** Fecha de emisión del recibo */
  reservationDate?: string
  /** Fecha y hora de recogida (alquiler) */
  pickupDateTime?: string
  /** Lugar de recogida (alquiler) */
  pickupLocation?: string
  /** Fecha y hora de entrega (alquiler) */
  dropoffDateTime?: string
  /** Lugar de entrega (alquiler) */
  dropoffLocation?: string
  customerName: string
  customerEmail?: string
  customerAddress?: string
  items: ReceiptItem[]
  subtotal: number | string
  tax?: number
  discount?: number
  total: number
  notes?: string
  companyName: string
  companyLogo?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyWebsite?: string
  qrValue?: string
  paymentMethod?: string
  paymentStatus?: "Completado" | "En proceso" | "Cancelado"
  dueDate?: string
  /** Vehicle data (for rental receipts) */
  vehicle?: {
    brand: string
    model: string
    year: number
    color: string
    plate?: string | null
    vin?: string | null
    fuel_type: string
    transmission: string
    engine: string
  }
}
