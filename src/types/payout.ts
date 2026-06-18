export type PayoutStatusType = "pending" | "paid";

export interface PayoutSummary {
  totalCollected: number;
  totalCommission: number;
  totalPayable: number;
  totalPaid: number;
  outstanding: number;
  previousTotalCollected?: number;
  bookingCount?: number;
}

export interface PayoutBooking {
  bookingId: string;
  hostId: string;
  hostName: string;
  productId: string;
  productName: string;
  bookingDate: string;
  total: string;
  commission: string;
  hostEarnings: string;
  payoutStatus: PayoutStatusType;
}

export interface PayoutRecord {
  id: string;
  bookingId: string;
  hostName: string;
  productName: string;
  hostEarnings: string;
  commissionAmount: string;
  totalCollected: string;
  paidAt: string;
  paymentMethod: string;
  paymentReference: string;
  paidBy: string;
  notes: string;
  attachmentUrl: string;
}

export interface PayoutFilters {
  dateFrom?: string;
  dateTo?: string;
  hostId?: string;
  productId?: string;
  payoutStatus?: PayoutStatusType;
  page?: number;
  pageSize?: number;
}

export interface PayoutBookingsResponse {
  data: PayoutBooking[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PayoutHistoryResponse {
  data: PayoutRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface HostOption {
  id: string;
  name: string;
}

export interface ProductOption {
  id: string;
  name: string;
}
