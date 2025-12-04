import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUserOrders } from "@/hooks/useUserOrders";
import type { Order, OrderStatus } from "@/types/order";
import {
  getPurchasedProductsByOrder,
  saveProductReview,
} from "@/lib/repositories/reviewRepository";
import type { PurchasedProduct } from "@/types/review";

const OrderReviews = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, authLoading } = useAuth();
  const { toast } = useToast();
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders(user?.id);

  const [rating, setRating] = useState("5");
  const [message, setMessage] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


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

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "completed"),
    [orders]
  );

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId");

    if (orderIdParam && completedOrders.some((order) => order.id === orderIdParam)) {
      setSelectedOrderId(orderIdParam);
      return;
    }

    if (!selectedOrderId && completedOrders.length > 0) {
      setSelectedOrderId(completedOrders[0].id);
    }
  }, [completedOrders, searchParams, selectedOrderId]);

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
        }).format(new Date(order.createdAt))
      : "Tanggal tidak tersedia";

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

    const labels: Record<OrderStatus, string> = {
      pending: "Pending",
      processed: "Diproses",
      packaged: "Dikemas",
      shipped: "Dikirim",
      completed: "Selesai",
      failed: "Gagal",
      expired: "Kedaluwarsa",
      cancelled: "Dibatalkan",
    };

    return (
      <Badge className={`${COLORS[status]} capitalize`} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  const selectedOrder = completedOrders.find((order) => order.id === selectedOrderId);
  useEffect(() => {
    if (!selectedOrderId) {
      setPurchasedProducts([]);
      return;
    }

    let isActive = true;

    const fetchProducts = async () => {
      const res = await getPurchasedProductsByOrder(selectedOrderId);
      if (isActive) setPurchasedProducts(res ?? []);
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [selectedOrderId]);


  useEffect(() => {
    if (purchasedProducts.length > 0) {
      setSelectedProductId((current) => current ?? purchasedProducts[0].productId);
      return;
    }

    setSelectedProductId(undefined);
  }, [purchasedProducts]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedOrder) {
      toast({ title: "Pilih pesanan terlebih dahulu", description: "Tentukan pesanan selesai yang ingin kamu review." });
      return;
    }

    if (!selectedProductId) {
      toast({ title: "Pilih produk", description: "Tentukan produk dari pesanan ini yang ingin kamu ulas." });
      return;
    }

    if (!user?.id) {
      toast({ title: "Session tidak valid", description: "Silakan login ulang." });
      return;
    }

    setIsSubmitting(true);
const review = await saveProductReview({
  orderId: selectedOrderId!,
  productId: selectedProductId!,
  rating: Number(rating),
  message,
  userId: user.id,
});




    setIsSubmitting(false);

    if (!review) {
      toast({ title: "Gagal menyimpan ulasan", description: "Periksa koneksi dan coba lagi." });
      return;
    }

    toast({
      title: "Terima kasih atas ulasanmu!",
      description: "Ulasan berhasil disimpan dan muncul di halaman detail produk.",
    });

    console.info("Review tersimpan", review);

    setMessage("");
    setRating("5");
  };

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Berbagi pengalamanmu</p>
            <h1 className="text-3xl font-bold">Ulasan Pesanan Selesai</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Kembali</Button>
            <Button asChild>
              <Link to="/">Lanjut belanja</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kenapa ulasan penting?</CardTitle>
            <CardDescription>
              Pesanan dengan status <strong>completed</strong> di Supabase bisa kamu review di sini. Kami siapkan pengalaman
              yang rapi agar feedback-mu tersampaikan dengan minim error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-background p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Pesanan selesai</p>
                <p className="text-2xl font-semibold">
                  {ordersLoading ? <Skeleton className="h-8 w-16" /> : completedOrders.length}
                </p>
                <p className="text-xs text-muted-foreground">Siap diberikan ulasan</p>
              </div>
              <div className="rounded-xl border bg-background p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Nilai rata-rata</p>
                <p className="text-2xl font-semibold">{rating}/5</p>
                <p className="text-xs text-muted-foreground">Sesuaikan sesuai pengalamanmu</p>
              </div>
              <div className="rounded-xl border bg-background p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Total checkout</p>
                <p className="text-2xl font-semibold">
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatCurrency(orders.reduce((sum, order) => sum + (order.totalPrice ?? 0), 0))
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Untuk semua pesanan kamu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pesanan selesai</CardTitle>
              <CardDescription>Pilih pesanan berstatus completed untuk diulas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ordersLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : completedOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Belum ada pesanan berstatus completed. Setelah admin mengirimkan pesanan dan status berubah, ulasanmu bisa ditulis di sini.
                </div>
              ) : (
                completedOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full rounded-xl border bg-background p-4 text-left transition hover:shadow-md focus:outline-none ${
                      selectedOrderId === order.id ? "border-primary shadow-sm" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">ID: {order.id}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order)}</p>
                      </div>
                      {renderOrderBadge(order.status)}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{order.shippingMethod || "Pengiriman selesai"}</span>
                      <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                      <span className="font-semibold text-foreground">{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Form ulasan</CardTitle>
              <CardDescription>
                Berikan rating dan cerita singkat tentang pengalamanmu setelah pesanan berhasil diterima.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Pesanan yang dipilih</p>
                  {selectedOrder ? (
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">ID: {selectedOrder.id}</span>
                        {renderOrderBadge(selectedOrder.status)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-muted-foreground">
                        <span>{selectedOrder.shippingMethod || "Pengiriman selesai"}</span>
                        <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                        <span>{selectedOrder.paymentMethod || "Pembayaran selesai"}</span>
                        <Separator orientation="vertical" className="hidden h-4 sm:inline" />
                        <span className="font-semibold text-foreground">
                          {formatCurrency(selectedOrder.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Pilih dulu pesanan selesai yang ingin kamu ulas.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Pilih produk dalam pesanan ini</p>
                  {purchasedProducts.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Produk dari pesanan sukses akan muncul di sini setelah pembayaran selesai.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {purchasedProducts.map((product) => (
                        <button
                          key={product.productId}
                          type="button"
                          onClick={() => setSelectedProductId(product.productId)}
                          className={`flex items-start gap-3 rounded-lg border bg-background p-3 text-left transition hover:shadow-sm focus:outline-none ${
                            selectedProductId === product.productId ? "border-primary ring-2 ring-primary/30" : ""
                          }`}
                        >
                          <div className="h-14 w-14 overflow-hidden rounded-md bg-muted">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                Foto
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.brand || "Brand tidak tersedia"}
                            </p>
                            <p className="text-xs font-medium text-primary">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Rating</p>
                    <Select value={rating} onValueChange={setRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {["5", "4", "3", "2", "1"].map((value) => (
                          <SelectItem key={value} value={value}>
                            {value} / 5
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Mood belanja</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant="secondary">Elegan</Badge>
                      <Badge variant="outline">Responsif</Badge>
                      <Badge variant="outline">Minimal error</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Ceritakan pengalamanmu</p>
                  <Textarea
                    placeholder="Bagikan kesan setelah pesanan ini sampai."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="min-h-[140px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>Tutup</Button>
                  <Button type="submit" disabled={!selectedOrder || isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Kirim ulasan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderReviews;
