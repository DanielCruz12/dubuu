
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
export type PaymentMethod = "bank" | "blink" | "visa" | "mastercard";

// Tipos para los formularios
export interface BankFormValues {
  bankName: string
  accountType: string
  accountNumber: string
  holderName: string
  email: string
}

/** Datos para recibir transferencias vía Blink (Bitcoin/Lightning). Ver https://dev.blink.sv */
export interface BlinkFormValues {
  /** Dirección Lightning o wallet Blink (ej: usuario@blink.sv o wallet ID) */
  walletAddress: string
  /** Correo de contacto (opcional) */
  email: string
}

// Datos existentes
export interface ExistingPaymentData {
  paymentMethod: PaymentMethod
  bankData: BankFormValues
  /** Presente cuando paymentMethod === "blink" */
  blinkData?: BlinkFormValues
}

// Datos para enviar al backend
export interface PaymentAccountData {
  user_id?: string
  bank_name?: string
  account_type?: string
  account_number?: string
  holder_name?: string
  email: string
  payment_method: string
  /** Cuando payment_method === "blink": dirección wallet Blink / Lightning */
  blink_wallet_address?: string
}
