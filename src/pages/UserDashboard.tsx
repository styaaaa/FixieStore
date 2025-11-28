import { useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading, signOut } = useAuth();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  }, [navigate, signOut]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [authLoading, isAdmin, navigate, user]);

  const initial = user?.email?.charAt(0)?.toUpperCase() ?? "U";

  if (!user || isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memuat dashboard</CardTitle>
            <CardDescription>Menyiapkan akun Anda...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selamat datang kembali</p>
            <h1 className="text-3xl font-bold">Dashboard Pengguna</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Kembali ke toko</Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={(user.user_metadata as Record<string, string> | undefined)?.avatar_url}
                alt="Avatar pengguna"
              />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.user_metadata?.full_name || "Akun Anda"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gunakan dashboard ini untuk melacak pesanan, memperbarui profil, atau melihat rekomendasi terbaru.
            </p>
            <Separator />
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/">Lanjut belanja</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/">Lihat keranjang</Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Keluar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
