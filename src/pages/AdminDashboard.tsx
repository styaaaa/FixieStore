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
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
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
    console.log("USER:", user);
    console.log("IS ADMIN:", isAdmin);
    console.log("LOADING:", authLoading);

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAdmin, navigate, user]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memuat dashboard admin</CardTitle>
            <CardDescription>Memverifikasi hak akses...</CardDescription>
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Akses admin terverifikasi</p>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Dashboard Admin</h1>
              <Badge variant="secondary">Admin</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Lihat toko</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan akun</CardTitle>
            <CardDescription>Kelola data toko dan pantau aktivitas pengguna.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm text-muted-foreground">Peran</p>
                <p className="text-lg font-semibold">Administrator</p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/">Kelola katalog</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/">Pantau pesanan</Link>
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

export default AdminDashboard;
