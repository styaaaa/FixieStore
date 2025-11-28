import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        console.error("Failed to get session:", error.message);
      }

      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    };

    void loadSession();

    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }, []);

  const isAdmin = useMemo(
    () => Boolean(user?.app_metadata?.is_admin || user?.user_metadata?.is_admin),
    [user],
  );

  const value = useMemo(
    () => ({ user, isAdmin, authLoading, signOut }),
    [authLoading, isAdmin, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
