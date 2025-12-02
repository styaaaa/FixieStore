import { supabase } from "@/lib/supabaseClient";

export async function getReviewsByOrder(orderId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId);

  if (error) {
    console.error("Error fetching review:", error);
    return [];
  }

  return data || [];
}
