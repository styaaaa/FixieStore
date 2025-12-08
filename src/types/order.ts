export type OrderStatus =
  | "pending"
  | "processed"
  | "packaged"
  | "shipped"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

export interface Order {
  id: string;
  userId: string | null;
  status: OrderStatus;
  productName?: string | null;
  createdAt: string | null;
  paymentMethod: string | null;
  shippingMethod: string | null;
  totalPrice: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  pendingAt?: string | null;
  processedAt?: string | null;
  packagedAt?: string | null;
  shippedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  name?: string | null;
}
