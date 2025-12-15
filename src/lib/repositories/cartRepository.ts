import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/catalog";

/* ============================
   Types
============================ */

type CartItemRow = Tables<"cart_items"> & {
  product: Tables<"products"> | null;
};

/* ============================
   Mapper
============================ */

const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  brandId: row.brand_id ?? null,
  brand: row.brand?.name ?? undefined,
  price: Number(row.price ?? 0),
  stock: row.stock ?? 0,
  imageUrl: row.image_url ?? "",
  description: row.description ?? "",
  longDescription: row.long_description ?? "",
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

/* ============================
   Queries
============================ */

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      product_id,
      created_at,
      product:products (
        id,
        name,
        brand_id,
        price,
        stock,
        image_url,
        description,
        long_description,
        category_id,
        created_at,
        brand:brands ( id, name )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cart items", error);
    throw error;
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      createdAt: row.created_at,
      product: row.product ? mapProduct(row.product) : undefined,
    })) ?? []
  );
};


/* ============================
   Mutations
============================ */

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
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: (existing.quantity ?? 0) + quantity })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating cart item", error);
      throw error;
    }
    return;
  }

  const { error } = await supabase.from("cart_items").insert({
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
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);

  if (error) {
    console.error("Error removing cart item", error);
    throw error;
  }
};

export const clearCartItems = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error clearing cart items", error);
    throw error;
  }
};
