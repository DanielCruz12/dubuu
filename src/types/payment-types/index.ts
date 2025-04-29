
export type Region = {
    id: string;
    nombre: string;
    codigoPostal: string | null;
  };
  
  export type Country = {
    id: string;
    nombre: string;
    orden: number;
    regiones: Region[];
  };

  // Tipos para los métodos de pago
export type PaymentMethod = "bank" | "visa" | "mastercard"

// Tipos para los formularios
export interface BankFormValues {
  bankName: string
  accountType: string
  accountNumber: string
  holderName: string
  email: string
}

// Datos existentes
export interface ExistingPaymentData {
  paymentMethod: PaymentMethod
  bankData: BankFormValues
}

// Datos para enviar al backend
export interface PaymentAccountData {
  user_id?: string
  bank_name: string
  account_type: string
  account_number: string
  holder_name: string
  email: string
  payment_method: string
}
