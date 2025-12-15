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
import type { Order, OrderStatus } from "@/types/order";
import type { ProductReview, PurchasedProduct } from "@/types/review";
import {
  getReviewsByOrder,
  getPurchasedProductsByOrder,
} from "@/lib/repositories/reviewRepository";
import { supabase } from "@/lib/supabaseClient";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading, signOut } = useAuth();

  /* =========================
     DATA
     ========================= */
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders(user?.id);
  const { data: profile } = useUserProfile(user?.id);

  /* =========================
     STATE
     ========================= */
  const [orderReviews, setOrderReviews] = useState<Record<string, ProductReview[]>>({});
  const [purchasedProducts, setPurchasedProducts] = useState<Record<string, PurchasedProduct[]>>({});
  const [cartCount, setCartCount] = useState<number | null>(null);
  const [cartLoading, setCartLoading] = useState(false);

  /* =========================
     AUTH GUARD
     ========================= */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Gagal keluar:", err);
    }
  }, [signOut, navigate]);

  /* =========================
     USER INFO
     ========================= */
  const initial = useMemo(
    () => (profile?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase(),
    [profile?.full_name, user?.email]
  );

  const displayName = useMemo(() => {
    if (profile?.full_name) return profile.full_name;

    return (
      (user?.user_metadata as Record<string, string> | undefined)?.full_name ||
      user?.email ||
      "Akun Anda"
    );
  }, [profile?.full_name, user?.user_metadata, user?.email]);

  /* =========================
     ORDER CONSTANTS
     ========================= */
  const statusFlow: OrderStatus[] = [
    "pending",
    "processed",
    "packaged",
    "shipped",
    "completed",
  ];

  const activeStatuses: OrderStatus[] = [
    "pending",
    "processed",
    "packaged",
    "shipped",
  ];

  const statusLabels: Record<OrderStatus, string> = {
    pending: "Pending",
    processed: "Diproses",
    packaged: "Dikemas",
    shipped: "Dikirim",
    completed: "Selesai",
    failed: "Gagal",
    expired: "Kedaluwarsa",
    cancelled: "Dibatalkan",
  };

  /* =========================
     DERIVED ORDERS
     ========================= */
  const activeOrders = useMemo(
    () => orders.filter((o) => activeStatuses.includes(o.status)),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "completed"),
    [orders]
  );

  const ordersKey = useMemo(
    () => orders.map((o) => o.id).join("|"),
    [orders]
  );

  const completedOrdersKey = useMemo(
    () => completedOrders.map((o) => o.id).join("|"),
    [completedOrders]
  );

  /* =========================
     FETCH REVIEWS
     ========================= */
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (completedOrders.length === 0) {
        if (mounted) setOrderReviews({});
        return;
      }

      const entries = await Promise.all(
        completedOrders.map(async (order) => {
          try {
            const reviews = await getReviewsByOrder(order.id);
            return [order.id, Array.isArray(reviews) ? reviews : []] as const;
          } catch {
            return [order.id, []] as const;
          }
        })
      );

      if (mounted) {
        setOrderReviews(Object.fromEntries(entries));
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [completedOrdersKey]);

  /* =========================
     FETCH PURCHASED PRODUCTS
     ========================= */
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (orders.length === 0) {
        if (mounted) setPurchasedProducts({});
        return;
      }

      const entries = await Promise.all(
        orders.map(async (order) => {
          try {
            const products = await getPurchasedProductsByOrder(order.id);
            return [order.id, Array.isArray(products) ? products : []] as const;
          } catch {
            return [order.id, []] as const;
          }
        })
      );

      if (mounted) {
        setPurchasedProducts(Object.fromEntries(entries));
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [ordersKey]);

  /* =========================
     CART COUNT + REALTIME
     ========================= */
  const fetchCartCount = useCallback(async () => {
    if (!user?.id) {
      setCartCount(null);
      return;
    }

    setCartLoading(true);

    try {
      const { count } = await supabase
        .from("cart_items")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      setCartCount(Number(count ?? 0));
    } catch {
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchCartCount();
  }, [user?.id, fetchCartCount]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`cart-items:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${user.id}`,
        },
        fetchCartCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchCartCount]);

  /* =========================
     HELPERS
     ========================= */
  const formatCurrency = useCallback(
    (value?: number | null) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value ?? 0),
    []
  );

  const formatDate = useCallback(
    (order: Order) =>
      order.createdAt
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(order.createdAt))
        : "Tanggal tidak tersedia",
    []
  );

  const renderProductDetails = (order: Order) => {
    const items = purchasedProducts[order.id] ?? [];

    if (items.length === 0) {
      const productLabel = order.productName ?? "Produk tidak diketahui";
      return (
        <div className="rounded-lg border bg-muted/40 p-3 text-xs sm:text-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Detail Produk</p>
              <div className="text-foreground">
                <p className="font-medium leading-tight">{productLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {order.productName ? "Produk yang kamu checkout" : "Nama produk belum tercatat"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="font-semibold text-foreground">{formatCurrency(order.totalPrice)}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-muted/40 p-3 text-xs sm:text-sm space-y-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Produk Dipesan</p>

        {items.map((item) => (
          <div key={item.productId} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-md bg-muted" />
              )}
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-foreground">{formatCurrency(item.price)}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOrderBadge = (status: OrderStatus) => {
    const COLORS: Record<OrderStatus, string> = {
      pending: "bg-amber-100 text-amber-800",
      processed: "bg-blue-100 text-blue-700",
      packaged: "bg-indigo-100 text-indigo-700",
      shipped: "bg-sky-100 text-sky-700",
      completed: "bg-emerald-100 text-emerald-700",
      failed: "bg-red-100 text-red-700",
      expired: "bg-slate-100 text-slate-700",
      cancelled: "bg-rose-100 text-rose-700",
    };

    return (
      <Badge className={`${COLORS[status]} capitalize`} variant="secondary">
        {statusLabels[status]}
      </Badge>
    );
  };

  const renderStatusProgress = (status: OrderStatus) => {
    const currentIndex = statusFlow.indexOf(status);

    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {statusFlow.map((step, index) => {
          const isReached = index <= currentIndex;
          return (
            <div key={step} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${isReached ? "bg-primary" : "bg-muted-foreground/30"}`} />
              <span className={isReached ? "text-foreground" : "text-muted-foreground"}>
                {statusLabels[step]}
              </span>
              {index < statusFlow.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          );
        })}
      </div>
    );
  };

  // guard while redirecting / loading auth
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

  // --- render UI ---
  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selamat datang kembali</p>
            <h1 className="text-3xl font-bold">Dashboard Pengguna</h1>
          </div>
        </div>

        {/* User Card */}
        <Card>
          <CardHeader className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={(user.user_metadata as any)?.avatar_url} />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{displayName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Separator />
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/dashboard/profile")}>Edit profil</Button>
              <Button variant="secondary" asChild><Link to="/">Lanjut belanja</Link></Button>
              <Button variant="outline" onClick={handleSignOut}>Keluar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Ringkasan Pesanan + Keranjang */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
            <CardDescription>Lihat status pesanan kamu.</CardDescription>
          </CardHeader>

<CardContent>
  <div className="grid gap-4 sm:grid-cols-3">
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-sm text-white/90">Pesanan Aktif</p>
      <div className="text-2xl font-semibold text-white">
        {ordersLoading ? <Skeleton className="h-8 w-16" /> : activeOrders.length}
      </div>
    </div>

    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-sm text-white/90">Pesanan Selesai</p>
      <div className="text-2xl font-semibold text-white">
        {ordersLoading ? <Skeleton className="h-8 w-16" /> : completedOrders.length}
      </div>
    </div>

    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-sm text-white/90">Produk di Keranjang</p>
      <div className="text-2xl font-semibold text-white">
        {cartLoading ? <Skeleton className="h-8 w-16" /> : (cartCount ?? 0)}
      </div>
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
                  <CardDescription>Status pending → processed → packaged → shipped</CardDescription>
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
                activeOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border bg-background p-4 hover:shadow-md transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">ID Pesanan: {order.id}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order)}</p>
                      </div>
                      {renderOrderBadge(order.status)}
                    </div>

                    {renderProductDetails(order)}

                    <div className="rounded-lg bg-muted/50 p-3 text-xs">
                      <p className="mb-2 font-medium text-foreground">Perjalanan pesanan</p>
                      {renderStatusProgress(order.status)}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" asChild>
                        <Link to="/checkout">Bayar sekarang</Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/cart")}>Lihat keranjang</Button>
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
                  <CardDescription>Status completed</CardDescription>
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
                completedOrders.map((order) => {
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

                      {renderProductDetails(order)}

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
