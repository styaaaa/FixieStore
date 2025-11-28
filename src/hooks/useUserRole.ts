import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setRole(null);
          return;
        }

        if (!user) {
          setRole(null);
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
          return;
        }

        setRole(data?.is_admin === true ? "admin" : "user");
      } catch (error) {
        console.error("Unexpected error loading role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []); // ← benar hanya satu array dependency

  return { role, loading };
};
