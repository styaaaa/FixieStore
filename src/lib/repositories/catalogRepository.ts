import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types/catalog";
import type { Tables } from "@/integrations/supabase/types";

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
  imageUrl: row.image_url?.trim() || "",
  description: row.description?.trim() || "",
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
