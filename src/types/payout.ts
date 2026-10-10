export interface PayoutSummary {
  totalCollected: number;
  totalCommission: number;
  totalPayable: number;
  totalPaid: number;
  outstanding: number;
  previousTotalCollected?: number;
  bookingCount?: number;
  pendingHosts?: number;
}

/** Estado de pago de un host (tabla All Hosts). */
export type HostPayoutStatus = "pending" | "partial" | "paid";

export interface HostsTableRow {
  hostId: string;
  username: string;
  displayName: string;
  totalToPay: number;
  totalPaid: number;
  outstanding: number;
  lastPayment: string | null;
  status: HostPayoutStatus;
}

export interface HostsTableResponse {
  data: HostsTableRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface HostsTableParams {
  dateFrom?: string;
  dateTo?: string;
  hostId?: string;
  search?: string;
  status?: HostPayoutStatus;
  sortBy?: "username" | "totalToPay" | "totalPaid" | "outstanding" | "lastPayment";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/** Pago a host (modelo por-host, Fase 4). */
export interface PayoutRecord {
  id: string;
  hostId: string;
  hostName: string;
  amount: string;
  /** YYYY-MM-DD */
  paymentDate: string;
  /** HH:MM:SS o vacío */
  paymentTime: string;
  /** bank_transfer | cash | other */
  paymentMethod: string;
  bankAccountUsed: string;
  transactionReference: string;
  receiptUrl: string;
  notes: string;
  paidBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutFilters {
  dateFrom?: string;
  dateTo?: string;
  hostId?: string;
  page?: number;
  pageSize?: number;
}

export interface HostOption {
  id: string;
  name: string;
}

/** Fase 4 — detalle de pago de un host. */
export interface HostPaymentUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  imageUrl: string;
}

export interface HostPaymentFinances {
  totalToPay: number;
  totalPaid: number;
  outstanding: number;
  lastPayment: string | null;
  status: HostPayoutStatus;
  /** 0-100 */
  paidPercent: number;
}

export interface HostPaymentDetail {
  user: HostPaymentUser;
  finances: HostPaymentFinances;
}

export interface HostBankDetails {
  bankName: string;
  accountNumber: string;
  accountType: string;
  holderName: string;
  email: string;
  lastUpdated: string;
}

export interface HostPaymentHistoryParams {
  hostId: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PayoutHistoryResponse {
  data: PayoutRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RegisterPaymentInput {
  hostId: string;
  amount: number;
  /** YYYY-MM-DD */
  paymentDate: string;
  /** HH:mm */
  paymentTime?: string;
  /** Siempre transferencia bancaria (único método soportado). */
  transactionReference?: string;
  receiptUrl?: string;
  notes?: string;
  bankAccountUsed?: string;
  allowExceed?: boolean;
}
