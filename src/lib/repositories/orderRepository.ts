// src/lib/repositories/orderRepository.ts
import { supabase } from "@/lib/supabaseClient";

export type OrderStatus = "pending" | "success" | "failed" | "expired";

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

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number;
  payment_method: string;
  shipping_method: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  created_at: string;
}

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

  return data as Order;
};

export const markOrderAsPaid = async (orderId: string) => {
  const { error } = await supabase
    .from("orders")
    .update({ status: "success" })
    .eq("id", orderId);

  if (error) {
    console.error("markOrderAsPaid error", error);
    throw new Error("Gagal mengupdate status order");
  }
};
export const fetchOrdersByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchOrdersByUser error:", error);
    throw new Error("Gagal mengambil data orders");
  }

  return data;
};
