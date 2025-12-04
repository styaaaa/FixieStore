// src/lib/repositories/orderRepository.ts
import { supabase } from "@/lib/supabaseClient";
import type { Order, OrderStatus } from "@/types/order";

type OrderRow = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number | null;
  payment_method: string | null;
  shipping_method: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  created_at: string;
  pending_at?: string | null;
  processed_at?: string | null;
  packaged_at?: string | null;
  shipped_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
};

export interface CreateOrderPayload {
  userId: string;
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

const statusTimestampColumns: Partial<Record<OrderStatus, keyof OrderRow>> = {
  pending: "pending_at",
  processed: "processed_at",
  packaged: "packaged_at",
  shipped: "shipped_at",
  completed: "completed_at",
  cancelled: "cancelled_at",
};

export const mapOrderRowToOrder = (row: OrderRow): Order => ({
  id: row.id,
  userId: row.user_id,
  status: row.status,
  totalPrice: row.total_price ?? 0,
  paymentMethod: row.payment_method,
  shippingMethod: row.shipping_method,
  firstName: row.first_name,
  lastName: row.last_name,
  phone: row.phone,
  address: row.address,
  city: row.city,
  postalCode: row.postal_code,
  createdAt: row.created_at,
  pendingAt: row.pending_at ?? row.created_at,
  processedAt: row.processed_at,
  packagedAt: row.packaged_at,
  shippedAt: row.shipped_at,
  completedAt: row.completed_at,
  cancelledAt: row.cancelled_at,
});

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: payload.userId,
      status: "pending",
      total_price: payload.totalPrice,
      payment_method: payload.paymentMethod,
      shipping_method: payload.shippingMethod,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      postal_code: payload.postalCode,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("createOrder error", error);
    throw new Error("Gagal membuat order");
  }

  return mapOrderRowToOrder(data as OrderRow);
};

export const markOrderAsPaid = async (orderId: string) => {
  const { error } = await supabase
    .from("orders")
    .update({ status: "processed", processed_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error("markOrderAsPaid error", error);
    throw new Error("Gagal mengupdate status order");
  }
};

export const fetchOrdersByUser = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchOrdersByUser error:", error);
    throw new Error("Gagal mengambil data orders");
  }

  return (data as OrderRow[]).map(mapOrderRowToOrder);
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchAllOrders error:", error);
    throw new Error("Gagal mengambil data seluruh pesanan");
  }

  return (data as OrderRow[]).map(mapOrderRowToOrder);
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processed"],
  processed: ["packaged"],
  packaged: ["shipped"],
  shipped: ["completed"],
  completed: [],
  failed: [],
  expired: [],
  cancelled: [],
};

export const updateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single<{ status: OrderStatus }>();

  if (fetchError || !existing) {
    console.error("updateOrderStatus fetch error", fetchError);
    throw new Error("Pesanan tidak ditemukan");
  }

  if (existing.status === nextStatus) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!data) throw new Error("Pesanan tidak ditemukan");
    return mapOrderRowToOrder(data as OrderRow);
  }

  const allowed = allowedTransitions[existing.status]?.includes(nextStatus);
  if (!allowed) {
    throw new Error(`Perubahan status dari ${existing.status} ke ${nextStatus} tidak diizinkan`);
  }

  // FIX: dictionary fleksibel
  const updates: Record<string, any> = {
    status: nextStatus,
  };

  const timestampColumn = statusTimestampColumns[nextStatus];
  if (timestampColumn) {
    updates[timestampColumn as string] = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("updateOrderStatus error", error);
    throw new Error("Gagal memperbarui status pesanan");
  }

  return mapOrderRowToOrder(data as OrderRow);
};
