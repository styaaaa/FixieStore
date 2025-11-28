import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import type { Order } from "@/types/order";

interface CreateOrderInput {
  userId: string;
  status?: string;
  paymentMethod: string;
  shippingMethod: string;
  totalPrice: number;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

type OrderRow = Tables<"orders">;

const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  userId: row.user_id,
  status: row.status,
  createdAt: row.created_at,
  paymentMethod: row.payment_method,
  shippingMethod: row.shipping_method,
  totalPrice: typeof row.total_price === "number" ? row.total_price : Number(row.total_price ?? 0),
  firstName: row.first_name,
  lastName: row.last_name,
  phone: row.phone,
  address: row.address,
  city: row.city,
  postalCode: row.postal_code,
});

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const payload: TablesInsert<"orders"> = {
    user_id: input.userId,
    status: input.status ?? "pending",
    payment_method: input.paymentMethod,
    shipping_method: input.shippingMethod,
    total_price: input.totalPrice,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    address: input.address,
    city: input.city,
    postal_code: input.postalCode,
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Failed to create order", error);
    throw error;
  }

  return mapOrder(data as OrderRow);
};

export const fetchOrdersByUser = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders", error);
    throw error;
  }

  if (!data) return [];

  return data.map((row) => mapOrder(row as OrderRow));
};
