import { useCallback, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserOrders } from "@/hooks/useUserOrders";
import type { Order } from "@/types/order";
import { getReviewsByOrder } from "@/lib/repositories/reviewRepository";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading, signOut } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders(user?.id);

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

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status === "pending"),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "success"),
    [orders]
  );

  const formatCurrency = (value?: number | null) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value ?? 0);

  const formatDate = (order: Order) =>
    order.createdAt
      ? new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(order.createdAt))
      : "Tanggal tidak tersedia";

  const renderOrderBadge = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "success") {
      return <Badge className="bg-emerald-600 text-white">Selesai</Badge>;
    }

    if (normalized === "pending") {
      return <Badge variant="outline">Aktif</Badge>;
    }

    return <Badge variant="secondary">{status}</Badge>;
  };

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
      <div className="max-w-6xl mx-auto space-y-6">
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
                <Link to="/cart">Lihat keranjang</Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Keluar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
              <CardDescription>
                Pantau perjalanan setiap checkout yang kamu lakukan di Cosmic Cart.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">Pesanan aktif</p>
                  <p className="text-2xl font-semibold">
                    {ordersLoading ? <Skeleton className="h-8 w-16" /> : activeOrders.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Menunggu konfirmasi & pembayaran</p>
                </div>
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">Pesanan selesai</p>
                  <p className="text-2xl font-semibold">
                    {ordersLoading ? <Skeleton className="h-8 w-16" /> : completedOrders.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Berstatus sukses di Supabase</p>
                </div>
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">Total nilai</p>
                  <p className="text-2xl font-semibold">
                    {ordersLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      formatCurrency(orders.reduce((sum, order) => sum + (order.totalPrice ?? 0), 0))
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Akumulasi checkout kamu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Kesiapan & Bantuan</CardTitle>
              <CardDescription>
                Buat pengalaman belanjamu tetap elegan ala FixieStore.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p>
                  Status pesanan <strong>success</strong> menandakan transaksi sudah tercatat mulus di Supabase. Status
                  <strong> pending</strong> artinya masih aktif atau menunggu langkah berikutnya.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link to="/checkout">Lanjutkan checkout</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/dashboard/reviews">Halaman ulasan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>Pesanan Aktif</CardTitle>
                  <CardDescription>Status pending</CardDescription>
                </div>
                <Badge variant="outline">{activeOrders.length} pesanan</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ordersLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Belum ada pesanan aktif. Yuk, cek koleksi terbaru kami!
                </div>
              ) : (
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col gap-3 rounded-xl border bg-background p-4 transition hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">ID Pesanan: {order.id}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order)}</p>
                        </div>
                        {renderOrderBadge(order.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{order.shippingMethod || "Metode kirim belum diatur"}</span>
                        <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                        <span>{order.paymentMethod || "Menunggu pembayaran"}</span>
                        <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                        <span className="font-semibold text-foreground">
                          {formatCurrency(order.totalPrice)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" asChild>
                          <Link to="/checkout">Selesaikan pembayaran</Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/cart")}>
                          Lihat keranjang
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>Pesanan Selesai</CardTitle>
                  <CardDescription>Status success</CardDescription>
                </div>
                <Badge variant="secondary">{completedOrders.length} pesanan</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ordersLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : completedOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Belum ada pesanan selesai. Setelah sukses, kamu bisa beri ulasan di sini.
                </div>
              ) : (
                <div className="space-y-3">
                  {completedOrders.map((order) => {
                    const hasReview = getReviewsByOrder(order.id).length > 0;

                    return (
                    <div
                      key={order.id}
                      className="flex flex-col gap-3 rounded-xl border bg-background p-4 transition hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">ID Pesanan: {order.id}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order)}</p>
                        </div>
                        {renderOrderBadge(order.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{order.shippingMethod || "Pengiriman selesai"}</span>
                        <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                        <span>{order.paymentMethod || "Metode pembayaran"}</span>
                        <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                        <span className="font-semibold text-foreground">
                          {formatCurrency(order.totalPrice)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hasReview ? (
                          <div className="rounded-md border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                            Ulasan sudah diberikan
                          </div>
                        ) : (
                          <Button size="sm" asChild>
                            <Link to={`/dashboard/reviews?orderId=${order.id}`}>Beri ulasan</Link>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/">Belanja lagi</Link>
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
