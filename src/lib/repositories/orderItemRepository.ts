import { supabase } from "@/lib/supabaseClient";
import type { CartItem } from "@/types/cart";
import type { OrderItemRecap, OrderStatus } from "@/types/order";

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string | null;
  price: number | null;
  quantity: number | null;
  created_at: string | null;
  orders?: {
    status: OrderStatus | null;
  } | null;
}

const mapOrderItem = (row: OrderItemRow): OrderItemRecap => ({
  id: row.id,
  orderId: row.order_id,
  productId: row.product_id,
  name: row.name ?? "Produk",
  price: typeof row.price === "number" ? row.price : Number(row.price ?? 0),
  quantity: row.quantity ?? 0,
  status: row.orders?.status,
  createdAt: row.created_at,
});

export const saveOrderItemsForOrder = async (orderId: string, items: CartItem[]) => {
  if (!orderId || items.length === 0) return;

  const payload = items
    .filter((item) => item.product)
    .map((item) => ({
      order_id: orderId,
      product_id: item.product?.id ?? item.productId,
      name: item.product?.name ?? "Produk",
      price: item.product?.price ?? 0,
      quantity: item.quantity,
    }));

  if (payload.length === 0) return;

  const { error } = await supabase.from("order_items").upsert(payload);

  if (error) {
    console.error("saveOrderItemsForOrder error", error);
    throw new Error("Gagal menyimpan detail pesanan");
  }
};

export const fetchOrderItemsRecap = async (): Promise<OrderItemRecap[]> => {
  const { data, error } = await supabase
    .from("order_items")
    .select("id, order_id, product_id, name, price, quantity, created_at, orders(status)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchOrderItemsRecap error", error);
    throw new Error("Gagal mengambil rekap produk");
  }

  return (data as OrderItemRow[] | null)?.map(mapOrderItem) ?? [];
};
