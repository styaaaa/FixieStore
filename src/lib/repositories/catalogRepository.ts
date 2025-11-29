import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types/catalog";
import type { Tables } from "@/integrations/supabase/types";

export interface NewProductPayload {
  name: string;
  price: number;
  stock: number;
  brand?: string;
  description?: string;
  longDescription?: string;
  imageUrl?: string;
  categoryId?: string | null;
}

const mapCategory = (row: Tables<"categories">): Category => ({
  id: row.id,
  name: row.name?.trim() || "",
  slug: row.slug?.trim() || "",
});

const mapProduct = (row: Tables<"products">): Product => ({
  id: row.id,
  name: row.name,
  brand: row.brand?.trim() || "",
  price: typeof row.price === "number" ? row.price : Number(row.price ?? 0),
  stock: row.stock ?? 0,
  imageUrl: row.image_url?.trim() || "",
  description: row.description?.trim() || "",
  longDescription: row.long_description?.trim() || "",
  categoryId: row.category_id,
  createdAt: row.created_at,
});

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories", error);
    throw error;
  }

  const categories = (data ?? []).map(mapCategory);
  return categories.filter((category) => {
    const name = category.name.toLowerCase();
    const slug = category.slug.toLowerCase();
    return name !== "semua" && slug !== "semua";
  });
};

export const getProducts = async (categoryId?: string | null): Promise<Product[]> => {
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products", error);
    throw error;
  }

  return (data ?? []).map(mapProduct);
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product by id", error);
    throw error;
  }

  return data ? mapProduct(data) : null;
};

export const createProduct = async (payload: NewProductPayload): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: payload.name,
      brand: payload.brand?.trim() || null,
      price: payload.price,
      stock: payload.stock,
      description: payload.description?.trim() || null,
      long_description: payload.longDescription?.trim() || null,
      image_url: payload.imageUrl?.trim() || null,
      category_id: payload.categoryId || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating product", error);
    throw error;
  }

  return mapProduct(data);
};

export const updateProduct = async (
  productId: string,
  payload: Partial<NewProductPayload>,
): Promise<Product> => {
  const updates: Record<string, unknown> = {};

  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.brand !== undefined) updates.brand = payload.brand?.trim();
  if (payload.price !== undefined) updates.price = payload.price;
  if (payload.stock !== undefined) updates.stock = payload.stock;
  if (payload.description !== undefined)
    updates.description = payload.description?.trim();
  if (payload.longDescription !== undefined)
    updates.long_description = payload.longDescription?.trim();
  if (payload.imageUrl !== undefined) updates.image_url = payload.imageUrl?.trim();
  if (payload.categoryId !== undefined) updates.category_id = payload.categoryId ?? null;

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating product stock", error);
    throw error;
  }

  return mapProduct(data);
};

export const updateProductStock = async (
  productId: string,
  stock: number,
): Promise<Product> => updateProduct(productId, { stock });

export const decreaseProductStock = async (
  productId: string,
  quantity: number,
): Promise<Product> => {
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("id, stock")
    .eq("id", productId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching product stock", fetchError);
    throw fetchError;
  }

  if (!product) {
    throw new Error("Produk tidak ditemukan saat memperbarui stok");
  }

  const currentStock = product.stock ?? 0;
  const newStock = Math.max(currentStock - quantity, 0);

  return updateProductStock(productId, newStock);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("Error deleting product", error);
    throw error;
  }
};
