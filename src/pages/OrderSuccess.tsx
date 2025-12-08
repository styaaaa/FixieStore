// src/pages/OrderSuccess.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import type { Order } from "@/types/order";

const formatCurrency = (value: number | null | undefined) => {
  if (!value || isNaN(value)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

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
        // Map kolom snake_case → camelCase agar tidak undefined
        const mappedOrder: Order = {
          ...data,
          totalPrice: data.total_price, // Fix utama
        };

        setOrder(mappedOrder);
      }

      setLoading(false);
    };

    void fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <main className="container mx-auto flex items-center justify-center px-4 py-14">
        <Card className="w-full max-w-xl border-border/60 shadow-lg rounded-2xl">

          <CardHeader className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight">
              Pesananmu sedang diproses
            </CardTitle>

            <CardDescription className="max-w-sm leading-relaxed">
              Terima kasih telah berbelanja di{" "}
              <span className="font-semibold">FixieStore</span>. Simpan kode
              pesananmu untuk cek status dan riwayat order.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* ORDER BOX */}
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-5 py-4 text-sm">
              {order && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold text-base">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Status</span>
                    <span className="uppercase tracking-wide font-medium">
                      {order.status}
                    </span>
                  </div>
                </>
              )}

              {loading && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Memuat detail pesanan...
                </div>
              )}
            </div>

            {/* TRACKING SECTION */}
            <div className="rounded-xl border bg-background/70 px-5 py-4 flex gap-3 text-sm">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Truck className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Tracking pengiriman</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nomor resi dan detail ekspedisi akan muncul setelah pesanan
                  dikonfirmasi oleh tim FixieStore.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs text-muted-foreground leading-relaxed">
                Butuh bantuan? Hubungi support FixieStore dengan menyertakan ID
                pesanan.
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">Lihat riwayat pesanan</Link>
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
