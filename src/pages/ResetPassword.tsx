import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPassword(): JSX.Element {
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tryRecoverSessionFromUrl = async () => {
      try {
        // quick session check (v2)
        // @ts-ignore
        const { data } = await supabase.auth.getSession?.();
        if (data?.session) return;
      } catch {
        // ignore
      }

      const parseParams = (str: string) => {
        const params = new URLSearchParams(str.replace(/^[#?]/, ""));
        const out: Record<string, string> = {};
        for (const [k, v] of params.entries()) out[k] = v;
        return out;
      };

      const searchParamsObj = parseParams(window.location.search);
      const hashParamsObj = parseParams(window.location.hash || "");
      const params = { ...hashParamsObj, ...searchParamsObj };

      const access_token = params["access_token"] || params["access-token"] || params["token"];
      const refresh_token = params["refresh_token"] || params["refresh-token"];
      const code = params["code"];

      if (!access_token && !code) return;

      try {
        // 1) Try getSessionFromUrl (v2)
        // @ts-ignore
        if (typeof supabase.auth.getSessionFromUrl === "function") {
          try {
            // @ts-ignore
            await supabase.auth.getSessionFromUrl();
            // cleanup URL to remove tokens
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            return;
          } catch (err) {
            console.warn("getSessionFromUrl failed:", err);
          }
        }

        // 2) Try exchangeCodeForSession (some versions)
        // @ts-ignore
        if (code && typeof supabase.auth.exchangeCodeForSession === "function") {
          try {
            // @ts-ignore
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
              window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
              return;
            }
            console.warn("exchangeCodeForSession error:", error);
          } catch (err) {
            console.warn("exchangeCodeForSession threw:", err);
          }
        }

        // 3) If explicit tokens available, setSession (v2)
        if (access_token && typeof supabase.auth.setSession === "function") {
          try {
            // @ts-ignore
            await supabase.auth.setSession({
              access_token,
              refresh_token: refresh_token ?? undefined,
            });
            // remove token from URL for cleanliness
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            return;
          } catch (err) {
            console.warn("setSession failed:", err);
          }
        }
      } catch (err) {
        console.warn("Failed to recover session from URL:", err);
      }
    };

    tryRecoverSessionFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async () => {
    if (!password.trim()) {
      toast.error("Password baru tidak boleh kosong");
      return;
    }
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (
          /auth session missing/i.test(error.message) ||
          /invalid session/i.test(error.message) ||
          /expired/i.test(error.message)
        ) {
          toast.error("Session tidak ditemukan atau kadaluarsa. Silakan buka kembali link dari email.", {
            description: error.message,
          });
          setLoading(false);
          return;
        }
        toast.error("Gagal memperbarui password", { description: error.message });
        setLoading(false);
        return;
      }

      try {
        // @ts-ignore
        if (typeof supabase.auth.signOut === "function") {
          // @ts-ignore
          await supabase.auth.signOut();
        }
      } catch {
        // ignore
      }

      toast.success("Password berhasil diperbarui", {
        description: "Silakan login kembali dengan password baru.",
      });

      setTimeout(() => navigate("/login"), 900);
    } catch (err: any) {
      toast.error("Terjadi kesalahan saat memperbarui password", { description: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Masukkan password baru untuk akunmu.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password baru</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={handleUpdate} disabled={loading}>
            {loading ? "Memperbarui..." : "Perbarui Password"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
