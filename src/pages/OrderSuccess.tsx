// src/pages/OrderSuccess.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Loader2, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import type { Order } from "@/lib/repositories/orderRepository";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const OrderSuccess = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (!error && data) {
        setOrder(data as Order);
      }

      setLoading(false);
    };

    void fetchOrder();
  }, [orderId]);

  const shortId = orderId ? `${orderId.substring(0, 8)}...` : "Tidak tersedia";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <main className="container mx-auto flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-xl border-border/70 shadow-md">
          <CardHeader className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Pesananmu sedang diproses
            </CardTitle>
            <CardDescription className="max-w-md">
              Terima kasih telah berbelanja di <span className="font-semibold">FixieStore</span>. 
              Simpan kode pesananmu untuk cek status dan riwayat order.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID Pesanan</span>
                <span className="font-mono text-sm font-semibold">
                  {shortId}
                </span>
              </div>
              {order && (
                <>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">
                      {formatCurrency(order.total_price)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Status</span>
                    <span className="uppercase tracking-wide">
                      {order.status}
                    </span>
                  </div>
                </>
              )}
              {loading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Memuat detail pesanan...
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border bg-background/70 px-4 py-3 text-sm">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Konfirmasi pembayaran</p>
                  <p className="text-xs text-muted-foreground">
                    Jika kamu sudah menyelesaikan pembayaran di Midtrans, status akan otomatis 
                    terupdate di dashboard pesananmu.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-background/70 px-4 py-3 text-sm">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Tracking pengiriman</p>
                  <p className="text-xs text-muted-foreground">
                    Nomor resi dan detail ekspedisi akan muncul setelah pesanan dikonfirmasi
                    oleh tim FixieStore.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <div className="text-xs text-muted-foreground">
                Butuh bantuan? Hubungi support FixieStore dengan menyertakan ID pesanan.
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/user/orders">Lihat riwayat pesanan</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/">Kembali belanja</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderSuccess;
