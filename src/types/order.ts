export interface Order {
  id: string;
  userId: string | null;
  status: string;
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
}
