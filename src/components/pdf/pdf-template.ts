export type ReceiptItem = {
    id: string
    description: string
    quantity: number
    price: number
  }
  
  export type ReceiptProps = {
    receiptNumber: string
    date: string
    customerName: string
    customerEmail?: string
    customerAddress?: string
    items: ReceiptItem[]
    subtotal: number
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
    paymentStatus?: "Paid" | "Pending" | "Cancelled"
    dueDate?: string
  }
  