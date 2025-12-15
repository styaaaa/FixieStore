import { supabase } from "@/lib/supabaseClient";
import type { CartItem } from "@/types/cart";
import type { OrderItemRecap, OrderStatus } from "@/types/order";

/* ================================
   Types
================================ */

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number | null;
  created_at: string | null;
  orders?: {
    status: OrderStatus | null;
  } | null;
  product?: {
    id: string;
    name: string;
    price: number;
  } | null;
};

/* ================================
   Mapper
================================ */

const mapOrderItem = (row: OrderItemRow): OrderItemRecap => ({
  id: row.id,
  orderId: row.order_id,
  productId: row.product_id,
  name: row.product?.name ?? "Produk",
  price: Number(row.product?.price ?? 0),
  quantity: row.quantity ?? 0,
  status: row.orders?.status ?? undefined,
  createdAt: row.created_at,
});

/* ================================
   Save Order Items
================================ */

export const saveOrderItemsForOrder = async (
  orderId: string,
  items: CartItem[]
): Promise<void> => {
  if (!orderId || items.length === 0) return;

  const payload = items
    .filter((item) => item.productId)
    .map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
    }));

  if (payload.length === 0) return;

  const { error } = await supabase
    .from("order_items")
    .insert(payload);

  if (error) {
    console.error("saveOrderItemsForOrder error", error);
    throw new Error("Gagal menyimpan detail pesanan");
  }
};

/* ================================
   Fetch Order Items Recap
================================ */

export const fetchOrderItemsRecap = async (): Promise<OrderItemRecap[]> => {
  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id,
      order_id,
      product_id,
      quantity,
      created_at,
      orders (
        status
      ),
      product:products (
        id,
        name,
        price
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchOrderItemsRecap error", error);
    throw new Error("Gagal mengambil rekap produk");
  }

  if (!data) return [];

  return data.map((row) =>
    mapOrderItem(row as unknown as OrderItemRow)
  );
};
