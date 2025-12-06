import { AlertTriangle, CheckCircle2, Home, LogOut, Package, ShieldCheck, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Category, Product } from "@/types/catalog";

interface AdminMonitoringProps {
  categories: Category[];
  products: Product[];
  inventoryValue: number;
  lowStockProducts: number;
  activeOrders: number;
  completedOrders: number;
  onGoHome: () => void;
  onLogout: () => void;
  onAddProduct: () => void;
  onViewProducts: () => void;
  formatCurrency: (value?: number | null) => string;
}

export function AdminMonitoring({
  categories,
  products,
  inventoryValue,
  lowStockProducts,
  activeOrders,
  completedOrders,
  onGoHome,
  onLogout,
  onAddProduct,
  onViewProducts,
  formatCurrency,
}: AdminMonitoringProps) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/70 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_32%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.12),transparent_32%)]" />
        <div className="relative grid gap-6 bg-gradient-to-br from-primary/5 via-white/80 to-amber-50/60 p-6 md:grid-cols-[1.2fr,1fr] md:items-center dark:from-slate-900/40 dark:via-slate-900/80 dark:to-slate-950">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-white">
              <ShieldCheck className="h-4 w-4" />
              Mode Admin Aktif
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold leading-tight tracking-tight">Dashboard Admin</h1>
              <Badge variant="secondary" className="border-amber-200 bg-amber-50 text-amber-900 dark:border-white dark:bg-gray-800 dark:text-white">Terproteksi</Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                onClick={onGoHome}
                className="shadow-sm shadow-amber-200 transition hover:-translate-y-[1px] dark:shadow-slate-900"
              >
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Home
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-white/80 p-4 shadow-sm shadow-amber-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              <span>Kontrol Cepat</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start gap-2 border-amber-200/80 bg-white/60 text-primary shadow-sm transition hover:-translate-y-[1px] hover:border-primary/50 hover:shadow-amber-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-primary/50"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" /> Keluar
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 border-amber-200/80 bg-white/60 text-primary shadow-sm transition hover:-translate-y-[1px] hover:border-primary/50 hover:shadow-amber-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-primary/50"
                onClick={onAddProduct}
              >
                <Package className="h-4 w-4" />Tambah Produk
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 border-amber-200/80 bg-white/60 text-primary shadow-sm transition hover:-translate-y-[1px] hover:border-primary/50 hover:shadow-amber-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-primary/50"
                onClick={onViewProducts}
              >
                <TrendingUp className="h-4 w-4" /> Daftar Produk
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-amber-200/70 bg-white/80 shadow-sm shadow-amber-200/40 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventaris</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Harga x stok seluruh produk</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/70 bg-white/80 shadow-sm shadow-amber-200/40 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Kategori aktif: {categories.length || "-"}</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/70 bg-white/80 shadow-sm shadow-amber-200/40 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Produk dengan stok ≤ 5 unit</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/70 bg-white/80 shadow-sm shadow-amber-200/40 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">Selesai: {completedOrders}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminMonitoring;
