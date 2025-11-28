import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles" as any)
        .select("is_admin")
        .eq("id", user.id)
        .single<{
          is_admin: boolean | null;
        }>();

      if (error) {
        console.error("Error fetching role:", error);
        setRole(null);
      } else {
        setRole(data?.is_admin === true ? "admin" : "user");
      }

      setLoading(false);
    };

    load();
  }, []); // ← benar hanya satu array dependency

  return { role, loading };
};
