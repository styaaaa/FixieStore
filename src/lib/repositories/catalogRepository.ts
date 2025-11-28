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

export const updateProductStock = async (
  productId: string,
  stock: number,
): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .update({ stock })
    .eq("id", productId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating product stock", error);
    throw error;
  }

  return mapProduct(data);
};

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
