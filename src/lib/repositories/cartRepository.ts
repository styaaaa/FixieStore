import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/catalog";

type CartItemRow = Tables<"cart_items"> & {
  product: Tables<"products"> | null;
};

const mapProduct = (row: Tables<"products">): Product => ({
  id: row.id,
  name: row.name,
  brand: row.brand ?? "",
  price: typeof row.price === "number" ? row.price : Number(row.price ?? 0),
  imageUrl: row.image_url ?? "",
  description: row.description ?? "",
  categoryId: row.category_id,
  createdAt: row.created_at,
});

const mapCartItem = (row: CartItemRow): CartItem => ({
  id: row.id,
  productId: row.product_id ?? "",
  quantity: row.quantity ?? 1,
  createdAt: row.created_at,
  product: row.product ? mapProduct(row.product) : undefined,
});

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, product_id, created_at, product:products(id, name, brand, price, image_url, description, category_id, created_at)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cart items", error);
    throw error;
  }

  return (data as CartItemRow[] | null)?.map(mapCartItem) ?? [];
};

export const addCartItem = async (
  userId: string,
  productId: string,
  quantity = 1
): Promise<void> => {
  const { data: existing, error: fetchError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error checking existing cart item", fetchError);
    throw fetchError;
  }

  if (existing) {
    const newQuantity = (existing.quantity ?? 0) + quantity;
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating cart item", error);
      throw error;
    }
    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .insert({
      user_id: userId,
      product_id: productId,
      quantity,
    });

  if (error) {
    console.error("Error inserting cart item", error);
    throw error;
  }
};

export const updateCartItemQuantity = async (
  cartItemId: string,
  quantity: number
): Promise<void> => {
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId);

  if (error) {
    console.error("Error updating quantity", error);
    throw error;
  }
};

export const removeCartItem = async (cartItemId: string): Promise<void> => {
  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);

  if (error) {
    console.error("Error removing cart item", error);
    throw error;
  }
};

export const clearCartItems = async (userId: string): Promise<void> => {
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);

  if (error) {
    console.error("Error clearing cart items", error);
    throw error;
  }
};
