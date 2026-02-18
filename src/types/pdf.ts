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
  }
  