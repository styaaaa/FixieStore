import { supabase } from "@/lib/supabaseClient";

export interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  postal_code?: string | null;
  avatar_url?: string | null;
}

export interface ProfileUpdatePayload {
  full_name?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  postal_code?: string | null;
}

export const getProfileById = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
  .from("profiles")
  .select("id, email, full_name, phone, address, city, is_admin, created_at")
  .eq("id", userId)
  .single();


  if (error) {
    console.error("getProfileById error:", error);
    throw new Error("Gagal mengambil data profil");
  }

  return data ?? null;
};

export const upsertProfile = async (
  userId: string,
  payload: ProfileUpdatePayload
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .select("id, email, full_name,phone, city, address, postal_code")
    .single();

  if (error || !data) {
    console.error("upsertProfile error:", error);
    throw new Error("Gagal memperbarui profil");
  }

  return data as UserProfile;
};
