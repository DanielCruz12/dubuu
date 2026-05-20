export interface IRentalApplication {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  pickup: string;
  dropoff: string;
  pickupTime: string;
  returnTime: string;
  days: number;
  pricePerDay: number;
  estimatedTotal: number;
  message: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  duiFiles: string[];
  licenseFiles: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateRentalApplicationInput = Pick<
  IRentalApplication,
  | "productId"
  | "userId"
  | "productName"
  | "pickup"
  | "dropoff"
  | "pickupTime"
  | "returnTime"
  | "days"
  | "pricePerDay"
  | "estimatedTotal"
  | "message"
>;

export type UpdateRentalApplicationInput = Partial<{
  status: IRentalApplication["status"];
}>;
