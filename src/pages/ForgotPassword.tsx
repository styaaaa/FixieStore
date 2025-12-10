import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Contoh menggunakan komponen UI jika kamu punya (sesuaikan import jika beda)
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fungsi handleSubmit sudah dipakai pada <form onSubmit={handleSubmit}>
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const redirect = import.meta.env.VITE_APP_RESET_PASSWORD_REDIRECT;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirect ?? undefined,
      });

      if (error) {
        toast.error("Gagal mengirim email reset password", { description: error.message });
        return;
      }

      toast.success("Email reset password telah dikirim. Cek inbox/spam.");
      setEmail(""); // bersihkan input (opsional)
    } catch (err) {
      console.error("reset error:", err);
      toast.error("Terjadi kesalahan saat mengirim email reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lupa Kata Sandi</CardTitle>
          <CardDescription>Masukkan email Anda untuk mereset kata sandi.</CardDescription>
        </CardHeader>

        {/* Pastikan onSubmit di-form memanggil handleSubmit */}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </CardContent>

          <CardFooter>
            {/* tombol type="submit" agar form memicu onSubmit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Kirim Email Reset"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
