import type { CartItem } from "@/types/cart";
import type { ProductReview, PurchasedProduct } from "@/types/review";
import { supabase } from "@/lib/supabaseClient";

const ORDER_PRODUCTS_STORAGE_KEY = "order_products";
const REVIEW_SELECT =
  "id, order_id, product_id, rating, comment, created_at, user_id, profiles:user_id(email, full_name)";

type ReviewRow = {
  id: string;
  order_id?: string | null;
  product_id: string;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
  user_id?: string | null;
  profiles?: { email?: string | null; full_name?: string | null } | null;
};

const isBrowser = typeof window !== "undefined";

const readFromStorage = <T>(key: string): T[] => {
  if (!isBrowser) return [];

  const raw = window.localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to parse ${key} from localStorage`, error);
    return [];
  }
};

const writeToStorage = <T>(key: string, value: T[]) => {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const mapReview = (payload: ReviewRow): ProductReview => ({
  id: payload.id,
  orderId: payload.order_id ?? "",
  productId: payload.product_id,
  rating: payload.rating,
  message: payload.comment ?? "",
  createdAt: payload.created_at ?? new Date().toISOString(),
  userName: payload.profiles?.full_name ?? payload.profiles?.email ?? undefined,
  userId: payload.user_id ?? undefined,
});

export const savePurchasedProducts = (orderId: string, items: CartItem[]) => {
  const payloads: PurchasedProduct[] = items
    .filter((item) => item.product)
    .map((item) => ({
      orderId,
      productId: item.productId,
      name: item.product?.name ?? "Produk",
      brand: item.product?.brand ?? "",
      imageUrl: item.product?.imageUrl ?? "",
      price: item.product?.price ?? 0,
    }));

  if (payloads.length === 0) return;

  const existing = readFromStorage<PurchasedProduct>(ORDER_PRODUCTS_STORAGE_KEY);
  const merged = [...existing.filter((item) => item.orderId !== orderId), ...payloads];
  writeToStorage(ORDER_PRODUCTS_STORAGE_KEY, merged);
};

export const getPurchasedProductsByOrder = (orderId?: string) => {
  if (!orderId) return [] as PurchasedProduct[];

  const existing = readFromStorage<PurchasedProduct>(ORDER_PRODUCTS_STORAGE_KEY);
  return existing.filter((item) => item.orderId === orderId);
};

export const saveProductReview = async (
  review: Omit<ProductReview, "id" | "createdAt" | "userName"> & { userId: string },
): Promise<ProductReview | null> => {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      order_id: review.orderId,
      product_id: review.productId,
      rating: review.rating,
      comment: review.message,
      user_id: review.userId,
    })
    .select(REVIEW_SELECT)
    .single();

  if (error) {
    console.error("Failed to save review:", error);
    return null;
  }

  return mapReview(data);
};

export const getReviewsByProduct = async (productId?: string): Promise<ProductReview[]> => {
  if (!productId) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch product reviews:", error);
    return [];
  }

  return (data ?? []).map(mapReview);
};

export const getReviewsByOrder = async (orderId?: string): Promise<ProductReview[]> => {
  if (!orderId) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch order reviews:", error);
    return [];
  }

  return (data ?? []).map(mapReview);
};
