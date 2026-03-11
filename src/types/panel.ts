export interface PanelActiveReservations {
  total: number;
  changeFromLastMonth: number;
  thisMonth: number;
  lastMonth: number;
  /** Fecha de la última reserva (ISO) para mostrar "Última reserva: ..." */
  lastReservationAt?: string | null;
}

export interface PanelTotalRevenue {
  total: number;
  percentChangeFromLastYear: number;
  thisYearTotal: number;
  lastYearTotal: number;
  /** Fecha del último ingreso (ISO) para mostrar "Último ingreso: ..." */
  lastIncomeAt?: string | null;
}

export interface PanelFrequentTravelers {
  count: number;
}

export interface ReservationActivityItem {
  month: string;
  label: string;
  year: number;
  count: number;
}

export interface UpcomingReservationItem {
  id: string;
  productName: string;
  productBanner: string;
  productId: string;
  total: string;
  status: "in-process" | "completed" | "pending" | "cancelled";
  date: string;
  guestName: string;
}

export interface PanelUpcomingReservations {
  reservations: UpcomingReservationItem[];
  total: number;
}

export interface PanelSummary {
  activeReservations: PanelActiveReservations;
  totalRevenue: PanelTotalRevenue;
  frequentTravelers: PanelFrequentTravelers;
  reservationActivity: ReservationActivityItem[];
  upcomingReservations: PanelUpcomingReservations;
}
