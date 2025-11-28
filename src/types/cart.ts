import type { Product } from "./catalog";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string | null;
  product?: Product;
}
