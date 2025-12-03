import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useUserProfile } from "@/hooks/useUserProfile";
import type { Order } from "@/types/order";
import type { ProductReview } from "@/types/review";
import { getReviewsByOrder } from "@/lib/repositories/reviewRepository";


const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading, signOut } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders(user?.id);
  const { data: profile } = useUserProfile(user?.id);
  const [orderReviews, setOrderReviews] = useState<Record<string, ProductReview[]>>({});

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

  const initial = (profile?.full_name ?? user?.email ?? "U")
  .charAt(0)
  .toUpperCase();

const displayName = useMemo(() => {
  if (profile?.full_name) return profile.full_name;

  return (user?.user_metadata as Record<string, string> | undefined)?.full_name 
    || user?.email 
    || "Akun Anda";
}, [profile?.full_name, user?.user_metadata, user?.email]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status === "pending"),
    [orders]
  );

  const completedOrders = useMemo(() => {
  return orders.filter((order) => order.status === "success");
}, [orders]);

// stringify agar dependency tidak berubah tiap render
const completedOrdersKey = useMemo(
  () => JSON.stringify(completedOrders.map((o) => o.id)),
  [completedOrders]
);

useEffect(() => {
  const fetchOrderReviews = async () => {
    if (completedOrders.length === 0) {
      setOrderReviews({});
      return;
    }

    const entries = await Promise.all(
      completedOrders.map(async (order) => {
        const reviews = await getReviewsByOrder(order.id);
        return [order.id, reviews] as const;
      })
    );

    setOrderReviews(Object.fromEntries(entries));
  };

  fetchOrderReviews();
}, [completedOrdersKey]);


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
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Selamat datang kembali</p>
          <h1 className="text-3xl font-bold">Dashboard Pengguna</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate("/dashboard/profile")}>Edit profil</Button>
          <Button variant="outline" onClick={() => navigate("/")}>Kembali ke toko</Button>
        </div>
      </div>

      {/* User Card */}
      <Card>
        <CardHeader className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={(user.user_metadata as any)?.avatar_url}
            />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{displayName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Kelola pesanan dan profil kamu dari satu tempat.
          </p>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to="/">Lanjut belanja</Link></Button>
            <Button variant="secondary" asChild><Link to="/cart">Keranjang</Link></Button>
            <Button variant="outline" onClick={handleSignOut}>Keluar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Profil & Alamat */}
      <Card>
        <CardHeader>
          <CardTitle>Profil & Alamat</CardTitle>
          <CardDescription>Kelola detail penerima untuk checkout cepat.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <p>Perbarui nama, telepon, kota, dan alamat lengkap.</p>
            <p className="mt-1">Digunakan otomatis saat checkout.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/profile")}>
            Edit profil
          </Button>
        </CardContent>
      </Card>

      {/* Ringkasan Pesanan */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <CardTitle>Ringkasan Pesanan</CardTitle>
          <CardDescription>Lihat status pesanan kamu.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border bg-background p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Pesanan aktif</p>
              <div className="text-2xl font-semibold">
                {ordersLoading ? <Skeleton className="h-8 w-16" /> : activeOrders.length}
              </div>
              <p className="text-xs text-muted-foreground">Menunggu konfirmasi & pembayaran</p>
            </div>

            <div className="rounded-xl border bg-background p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Pesanan selesai</p>
              <div className="text-2xl font-semibold">
                {ordersLoading ? <Skeleton className="h-8 w-16" /> : completedOrders.length}
              </div>
              <p className="text-xs text-muted-foreground">Pesanan sukses</p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Aktif + Selesai */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Pesanan Aktif */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
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
                Belum ada pesanan aktif.
              </div>
            ) : (
              activeOrders.map(order => (
                <div key={order.id} className="rounded-xl border bg-background p-4 hover:shadow-md transition space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">ID Pesanan: {order.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order)}</p>
                    </div>
                    {renderOrderBadge(order.status)}
                  </div>

                  {/* <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{order.shippingMethod || ""}</span>
                    <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                    <span>{order.paymentMethod || "Menunggu pembayaran"}</span>
                    <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                    <span className="font-semibold text-foreground">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div> */}

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link to="/checkout">Bayar sekarang</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/cart")}>
                      Lihat keranjang
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pesanan Selesai */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
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
                Belum ada pesanan selesai.
              </div>
            ) : (
              completedOrders.map(order => {
                const hasReview = (orderReviews[order.id] ?? []).length > 0;

                return (
                  <div key={order.id} className="rounded-xl border bg-background p-4 hover:shadow-md transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">ID Pesanan: {order.id}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order)}</p>
                      </div>
                      {renderOrderBadge(order.status)}
                    </div>

                    {/* <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>{order.shippingMethod || "Pengiriman selesai"}</span>
                      <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                      <span>{order.paymentMethod || "Metode pembayaran"}</span>
                      <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                      <span className="font-semibold text-foreground">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div> */}

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
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
};

export default UserDashboard;
