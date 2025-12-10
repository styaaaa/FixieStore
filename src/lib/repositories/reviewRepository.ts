import type { CartItem } from "@/types/cart";
import type { ProductReview, PurchasedProduct } from "@/types/review";
import { supabase } from "@/lib/supabaseClient";

/* ===========================================
   CONSTANTS
=========================================== */
const ORDER_PRODUCTS_STORAGE_KEY = "order_products";

const REVIEW_SELECT =
  "id, product_id, order_id, rating, comment, created_at, user_id, profiles:user_id(email, full_name, avatar_url)";

const isBrowser = typeof window !== "undefined";

/* ===========================================
   LOCAL STORAGE HELPERS
=========================================== */
const readFromStorage = <T>(key: string): T[] => {
  if (!isBrowser) return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeToStorage = <T>(key: string, value: T[]) => {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
};

/* ===========================================
   MAPPER — AMAN 100%
=========================================== */
const mapReview = (row: any): ProductReview => {
  const profile = row?.profiles ?? {};
  return {
    id: row?.id ?? "",
    productId: row?.product_id ?? "",
    orderId: row?.order_id ?? "",
    rating: row?.rating ?? 0,
    message: row?.comment ?? "",
    createdAt: row?.created_at ?? new Date().toISOString(),
    userId: row?.user_id ?? "",
    userName: profile.full_name || profile.email || undefined,
    userEmail: profile.email,
    userAvatarUrl: profile.avatar_url || undefined,
  };
};

/* ===========================================
   PURCHASED PRODUCTS STORAGE
=========================================== */
export const savePurchasedProducts = (orderId: string, items: CartItem[]) => {
  const payloads: PurchasedProduct[] = items
    .filter((item) => item.product)
    .map((item) => ({
      orderId,
      productId: item.product.id,
      name: item.product.name,
      brand: item.product.brand,
      imageUrl: item.product.imageUrl,
      price: item.product.price,
    }));

  const existing = readFromStorage<PurchasedProduct>(ORDER_PRODUCTS_STORAGE_KEY);
  const merged = [
    ...existing.filter((x) => x.orderId !== orderId),
    ...payloads,
  ];

  writeToStorage(ORDER_PRODUCTS_STORAGE_KEY, merged);
};

export const getPurchasedProductsByOrder = async (
  orderId?: string
): Promise<PurchasedProduct[]> => {
  if (!orderId) return [];
  const existing = readFromStorage<PurchasedProduct>(ORDER_PRODUCTS_STORAGE_KEY);
  return existing.filter((x) => x.orderId === orderId);
};

/* ===========================================
   SAVE REVIEW
=========================================== */
export const saveProductReview = async (review: {
  orderId: string;
  productId: string;
  rating: number;
  message: string;
  userId: string;
}): Promise<ProductReview | null> => {
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

/* ===========================================
   GET REVIEWS BY PRODUCT
=========================================== */
export const getReviewsByProduct = async (
  productId?: string
): Promise<ProductReview[]> => {
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

/* ===========================================
   GET REVIEWS BY ORDER (SUPABASE)
=========================================== */
export const getReviewsByOrder = async (
  orderId?: string
): Promise<ProductReview[]> => {
  if (!orderId) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews by order:", error);
    return [];
  }

  return (data ?? []).map(mapReview);
};
