import type { CartItem } from "@/types/cart";
import type { ProductReview, PurchasedProduct } from "@/types/review";

const REVIEW_STORAGE_KEY = "product_reviews";
const ORDER_PRODUCTS_STORAGE_KEY = "order_products";

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

export const savePurchasedProducts = (orderId: string, items: CartItem[]) => {
  const existing = readFromStorage<PurchasedProduct>(ORDER_PRODUCTS_STORAGE_KEY);

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

  const merged = [...existing.filter((item) => item.orderId !== orderId), ...payloads];
  writeToStorage(ORDER_PRODUCTS_STORAGE_KEY, merged);
};

export const getPurchasedProductsByOrder = (orderId?: string) => {
  if (!orderId) return [] as PurchasedProduct[];
  const existing = readFromStorage<PurchasedProduct>(ORDER_PRODUCTS_STORAGE_KEY);
  return existing.filter((item) => item.orderId === orderId);
};

export const saveProductReview = (
  review: Omit<ProductReview, "id" | "createdAt">,
): ProductReview => {
  const existing = readFromStorage<ProductReview>(REVIEW_STORAGE_KEY);
  const payload: ProductReview = {
    ...review,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  writeToStorage(REVIEW_STORAGE_KEY, [payload, ...existing]);
  return payload;
};

export const getReviewsByProduct = (productId?: string): ProductReview[] => {
  if (!productId) return [];
  const existing = readFromStorage<ProductReview>(REVIEW_STORAGE_KEY);
  return existing.filter((review) => review.productId === productId);
};
