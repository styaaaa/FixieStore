import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Package,
  Pencil,
  PlusCircle,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabaseClient";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "@/lib/repositories/catalogRepository";
import {
  fetchAllOrders,
  mapOrderRowToOrder,
  updateOrderStatus,
} from "@/lib/repositories/orderRepository";

import type { Product, Category } from "@/types/catalog";
import type { Order, OrderStatus } from "@/types/order";

// ============================
// Form State
// ============================

interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  stock: string;
  description: string;
  longDescription: string;
  categoryId: string | null;
  file: File | null;
}

const initialForm: ProductFormState = {
  name: "",
  brand: "",
  price: "",
  stock: "",
  description: "",
  longDescription: "",
  categoryId: null,
  file: null,
};

type DashboardView = "monitoring" | "order-status" | "add-product" | "product-table";

type NavLink = {
  id: DashboardView;
  label: string;
  description: string;
  icon: LucideIcon;
};

// ============================
// Component
// ============================

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProductFormState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [orderSaving, setOrderSaving] = useState<Record<string, boolean>>({});

  const navItems = useMemo<NavLink[]>(
    () => [
      {
        id: "monitoring",
        label: "Monitoring",
        description: "",
        icon: LayoutDashboard,
      },
      {
        id: "order-status",
        label: "Status Pesanan",
        description: "",
        icon: RefreshCcw,
      },
      {
        id: "add-product",
        label: "Tambah Produk",
        description: "",
        icon: PlusCircle,
      },
      {
        id: "product-table",
        label: "Daftar Produk",
        description: "",
        icon: ListChecks,
      },
    ],
    []
  );
  const [activeView, setActiveView] = useState<DashboardView>(navItems[0]?.id ?? "monitoring");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const statusFlow: OrderStatus[] = [
    "pending",
    "processed",
    "packaged",
    "shipped",
    "completed",
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

  const renderStatusBadge = (status: OrderStatus) => {
    const COLORS: Record<OrderStatus, string> = {
  pending: "bg-[#1c1c1c] text-white",
  processed: "bg-[#1c1c1c] text-white",
  packaged: "bg-[#1c1c1c] text-white",
  shipped: "bg-[#1c1c1c] text-white",
  completed: "bg-[#1c1c1c] text-white",
  failed: "bg-[#1c1c1c] text-white",
  expired: "bg-[#1c1c1c] text-white",
  cancelled: "bg-[#1c1c1c] text-white",
    };

    return (
      <Badge className={`${COLORS[status]} capitalize`} variant="secondary">
        {statusLabels[status]}
      </Badge>
    );
  };

  const getNextStatus = (status: OrderStatus) => {
    const currentIndex = statusFlow.indexOf(status);

    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return null;
    }

    return statusFlow[currentIndex + 1];
  };

  const formatCurrency = (value?: number | null) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value ?? 0);

    const isDesktopView = () => window.matchMedia("(min-width: 1024px)").matches;

  const navigateToView = (view: DashboardView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!isDesktopView()) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    setIsSidebarOpen(isDesktopView());
  }, []);  

  // ============================
  // Load Data
  // ============================

  const fetchOrderItemNames = useCallback(async (orderId: string) => {
    const { data, error } = await supabase
      .from("order_items")
      .select("name")
      .eq("order_id", orderId);

    if (error) {
      console.error("fetchOrderItemNames error", error);
      return null;
    }

    const names = data?.map((item) => item.name).filter(Boolean) as
      | string[]
      | undefined;

    return names && names.length > 0 ? names.join(", ") : null;
  }, []);

  const loadData = useCallback(async () => {
    try {
      setOrdersLoading(true);

      const [cats, prods, adminOrders] = await Promise.all([
        getCategories(),
        getProducts(),
        fetchAllOrders(),
      ]);

    const ordersWithNames = await Promise.all(
        adminOrders.map(async (order) => {
          if (order.productName) return order;

          const productName = await fetchOrderItemNames(order.id);
          return { ...order, productName: productName ?? order.productName };
        })
      );

      setCategories(cats);
      setProducts(prods);
      setOrders(ordersWithNames);
    } catch {
      toast({ variant: "destructive", title: "Gagal memuat data" });
    } finally {
      setLoading(false);
      setOrdersLoading(false);
    }
  }, [fetchOrderItemNames]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }

    void loadData();
  }, [authLoading, user, isAdmin, loadData, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return undefined;

    const channel = supabase
      .channel("orders-admin-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async (payload) => {
          const baseRow = (payload.new ?? payload.old) as any;
          let mapped = mapOrderRowToOrder(baseRow);

          if (!mapped.productName) {
            const productName = await fetchOrderItemNames(mapped.id);
            mapped = { ...mapped, productName };
          }

          setOrders((current) => {

            if (payload.eventType === "INSERT") {
              return [mapped, ...current];
            }

            if (payload.eventType === "UPDATE") {
              return current.map((order) =>
                order.id === mapped.id ? mapped : order
              );
            }

            if (payload.eventType === "DELETE") {
              return current.filter((order) => order.id !== mapped.id);
            }

            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
   }, [fetchOrderItemNames, isAdmin, user]);

  const setField = (f: keyof ProductFormState, v: any) =>
    setForm((p) => ({ ...p, [f]: v }));

  const setEditField = (f: keyof ProductFormState, v: any) =>
    setEditForm((p) => (p ? { ...p, [f]: v } : p));

  // ============================
  // Supabase Upload
  // ============================

  const uploadProductImage = async (file: File) => {
    const path = `products/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("image_product")
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("image_product")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  // ============================
  // Create Product
  // ============================

  const handleCreate = async (e: any) => {
    e.preventDefault();

    if (!form.name.trim() || !form.file) {
      toast({ variant: "destructive", title: "Nama dan file wajib" });
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await uploadProductImage(form.file);

      const newProduct = await createProduct({
        name: form.name,
        brand: form.brand,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl,
        description: form.description,
        longDescription: form.longDescription,
        categoryId: form.categoryId,
      });

      setProducts((p) => [newProduct, ...p]);
      setForm(initialForm);

      toast({ title: "Produk ditambahkan" });

    } catch {
      toast({ variant: "destructive", title: "Gagal menyimpan produk" });
    }

    setSaving(false);
  };

  // ============================
  // Edit Product
  // ============================

  const startEdit = (product: Product) => {
    setEditing(product);
    setEditForm({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description,
      longDescription: product.longDescription,
      categoryId: product.categoryId,
      file: null,
    });
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();

    if (!editing || !editForm) return;

    setSavingEdit(true);

    try {
      let imageUrl = editing.imageUrl;

      if (editForm.file) {
        imageUrl = await uploadProductImage(editForm.file);
      }

      const updated = await updateProduct(editing.id, {
        name: editForm.name,
        brand: editForm.brand,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        imageUrl,
        description: editForm.description,
        longDescription: editForm.longDescription,
        categoryId: editForm.categoryId,
      });

      setProducts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
      setEditForm(null);

      toast({ title: "Produk diperbarui" });
    } catch {
      toast({ variant: "destructive", title: "Gagal mengupdate produk" });
    }

    setSavingEdit(false);
  };

  // ============================
  // Delete Product
  // ============================

  const handleDelete = async (id: string) => {
    setDeleteLoading((s) => ({ ...s, [id]: true }));

    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((x) => x.id !== id));
      toast({ title: "Produk dihapus" });
    } catch {
      toast({ variant: "destructive", title: "Gagal menghapus" });
    }

    setDeleteLoading((s) => ({ ...s, [id]: false }));
  };

  // ============================
  // Order Status
  // ============================

  const handleAdvanceStatus = async (order: Order) => {
    const nextStatus = getNextStatus(order.status);

    if (!nextStatus) {
      toast({ title: "Status selesai", description: "Pesanan ini sudah completed" });
      return;
    }

    setOrderSaving((prev) => ({ ...prev, [order.id]: true }));

    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)));

      toast({
        title: "Status diperbarui",
        description: `${statusLabels[order.status]} → ${statusLabels[nextStatus]}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal memperbarui status",
        description: error instanceof Error ? error.message : "Coba lagi nanti",
      });
    } finally {
      setOrderSaving((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  // ============================
  // Render Helpers
  // ============================

  const inventoryValue = useMemo(
    () => products.reduce((s, p) => s + p.price * p.stock, 0),
    [products]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["pending", "processed", "packaged", "shipped"].includes(order.status)
      ).length,
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "completed").length,
    [orders]
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 5).length,
    [products]
  );

  if (!user || !isAdmin) return null;

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#0f0f0f] shadow-xl">
        <div className="relative grid gap-6 bg-[#0f0f0f] p-6 md:grid-cols-[1.2fr,1fr] md:items-center">
          <div className="space-y-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4" />
              Mode Admin Aktif
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold leading-tight tracking-tight">Dashboard Admin</h1>
              <Badge variant="secondary" className="border border-white/30 bg-white/10 text-white">Terproteksi</Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="border border-white/30 bg-transparent text-white transition hover:bg-white/10"
              >
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Home
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-black/60 p-4 shadow-none">
            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              <span>Kontrol Cepat</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start gap-2 border border-white/20 bg-transparent text-white transition hover:bg-white/10"
                onClick={() => navigate("/logout")}
              >
                <LogOut className="h-4 w-4" /> Keluar
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 border border-white/20 bg-transparent text-white transition hover:bg-white/10"
                onClick={() => navigateToView("add-product")}
              >
                <Package className="h-4 w-4" />Tambah Produk
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 border border-white/20 bg-transparent text-white transition hover:bg-white/10"
                onClick={() => navigateToView("product-table")}
              >
                <TrendingUp className="h-4 w-4" />Daftar Produk
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-[#2a2a2a] bg-[#0d0d0d] shadow-none text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventaris</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Harga x stok seluruh produk</p>
          </CardContent>
        </Card>

        <Card className="border border-[#2a2a2a] bg-[#0d0d0d] shadow-none text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Kategori aktif: {categories.length || "-"}</p>
          </CardContent>
        </Card>

       <Card className="border border-[#2a2a2a] bg-[#0d0d0d] shadow-none text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Produk dengan stok ≤ 5 unit</p>
          </CardContent>
        </Card>

        <Card className="border border-[#2a2a2a] bg-[#0d0d0d] shadow-none text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">Selesai: {completedOrders}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOrders = () => (
    <Card className="border border-[#2a2a2a] bg-[#111111] shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">Status Pesanan</CardTitle>
            <CardDescription>
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="border border-white/30 bg-white/10 text-white">
              Realtime Aktif
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {ordersLoading ? (
          <div className="space-y-3">
            <div className="h-12 w-full animate-pulse rounded-md bg-muted/60" />
            <div className="h-12 w-full animate-pulse rounded-md bg-muted/60" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
            Belum ada pesanan.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-800 shadow-sm">
            <Table className="text-sm">
              <TableHeader className="bg-black text-white">
                <TableRow className="text-xs uppercase tracking-wide text-muted-foreground">
                  <TableHead>Nama Produk & Tanggal</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => {
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <TableRow
                      key={order.id}
                      className="align-middle transition hover:bg-white/5"
                    >
                      <TableCell className="align-middle">
                        <p className="font-semibold">
                          {order.productName || `: ${order.name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString("id-ID")}
                        </p>
                      </TableCell>

                      <TableCell className="align-middle">
                        <p className="font-medium">
                          {[order.firstName, order.lastName].filter(Boolean).join(" ") || "Nama belum diisi"}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.city || "Kota belum diisi"}</p>
                      </TableCell>

                      <TableCell className="align-middle">{renderStatusBadge(order.status)}</TableCell>

                      <TableCell className="align-middle font-medium">{formatCurrency(order.totalPrice)}</TableCell>

                      <TableCell className="align-middle text-right">
                        {nextStatus ? (
                          <Button
                            size="sm"
                            onClick={() => handleAdvanceStatus(order)}
                            disabled={orderSaving[order.id]}
                          >
                            {orderSaving[order.id]
                              ? "Memperbarui..."
                              : `Ke ${statusLabels[nextStatus]}`}
                          </Button>
                        ) : (
                          <Badge variant="outline">
                            {statusLabels[order.status]}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAddProduct = () => (
    <Card className="border border-[#2a2a2a] bg-[#111111] shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Tambah Produk</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Produk</Label>
              <Input
                placeholder=""
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Brand</Label>
              <Input
                placeholder=""
                value={form.brand}
                onChange={(e) => setField("brand", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Harga</Label>
              <Input
                type="number"
                placeholder=""
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Stok</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setField("stock", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.categoryId ?? "none"}
                onValueChange={(v) => setField("categoryId", v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pilih kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
                
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi Singkat</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Deskripsi Panjang</Label>
            <Textarea
              rows={4}
              value={form.longDescription}
              onChange={(e) => setField("longDescription", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Gambar Produk</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setField("file", e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(initialForm)}
              className="border border-white/30 text-white hover:bg-white/10"
            >
              Reset
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Tambah Produk"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderProductTable = () => (
    <Card className="border border-[#2a2a2a] bg-[#111111] shadow-none">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Daftar Produk</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-800 shadow-sm">
            <Table className="text-sm">
              <TableHeader className="bg-black text-white">
                <TableRow className="text-xs uppercase tracking-wide text-muted-foreground">
                  <TableHead>Nama</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.map((p) => (
                  <TableRow
                    key={p.id}
                    className="align-middle transition hover:bg-white/5"
                  >
                    <TableCell className="align-middle">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.brand}</p>
                    </TableCell>

                    <TableCell className="align-middle">Rp {p.price.toLocaleString("id-ID")}</TableCell>

                    <TableCell className="align-middle">
                      <Badge variant={p.stock <= 5 ? "destructive" : "outline"}>
                        {p.stock} unit
                      </Badge>
                    </TableCell>

                    <TableCell className="flex justify-end gap-2 align-middle">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="border border-white/30 bg-transparent text-white hover:bg-white/10"
                        onClick={() => startEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleteLoading[p.id]}
                      >
                        {deleteLoading[p.id] ? "..." : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeView) {
      case "order-status":
        return renderOrders();
      case "add-product":
        return renderAddProduct();
      case "product-table":
        return renderProductTable();
      default:
        return renderMonitoring();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white transition-colors">
      <div className="flex items-center gap-3 px-4 py-4 lg:hidden">
        <Button
          variant="outline"
          className="flex items-center gap-2 border border-white/30 bg-black/60 text-white shadow-sm hover:bg-white/10"
          onClick={toggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls="admin-sidebar"
        >
          <Menu className="h-5 w-5" />
          <span>{isSidebarOpen ? "Tutup Menu" : "Menu"}</span>
        </Button>

        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <LayoutDashboard className="h-4 w-4" />
          <span>Admin Panel</span>
        </div>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div
        className={cn(
          "min-h-screen lg:grid",
          isSidebarOpen ? "lg:grid-cols-[260px,1fr]" : "lg:grid-cols-1"
        )}
      >
        <aside
          id="admin-sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r border-neutral-800 bg-black text-white shadow-xl transition-transform duration-200 ease-in-out",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:static lg:w-full lg:border-r lg:shadow-none",
            isSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full lg:hidden"
          )}
        >
          <div className="flex h-full flex-col gap-6 px-4 py-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Application</p>
              <div className="flex items-center gap-2 font-semibold text-white">
                <LayoutDashboard className="h-4 w-4" /> Admin Panel
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map(({ id, label, description, icon: Icon }) => (
                <Button
                  key={id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 rounded-xl bg-transparent px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10",
                    activeView === id &&
                      "bg-white/10 text-white shadow-inner"
                  )}
                  onClick={() => navigateToView(id)}
                  aria-current={activeView === id ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col items-start leading-tight">
                    <span>{label}</span>
                    <span className="text-xs text-white/60">{description}</span>
                  </div>
                </Button>
              ))}
            </nav>

            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => {
                  closeSidebar();
                  navigate("/");
                }}
              >
                <Home className="h-4 w-4" />
                Kembali ke Home
              </Button>
            </div>
          </div>
        </aside>

        <main
          className={cn(
            "space-y-6 px-4 py-8 lg:px-8",
            isSidebarOpen ? "lg:col-start-2" : "lg:col-start-1"
          )}
        >
          <div className="mb-2 hidden items-center gap-3 lg:flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-white/30 bg-black/60 text-white shadow-sm hover:bg-white/10"
              onClick={toggleSidebar}
              aria-expanded={isSidebarOpen}
              aria-controls="admin-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="text-sm font-semibold text-white/80">
            </div>
          </div>
          {renderContent()}
        </main>
      </div>

      {editing && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl border border-neutral-800 bg-[#0f0f0f] text-white">
            <CardHeader>
              <CardTitle>Edit Produk</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input value={editForm.name} onChange={(e) => setEditField("name", e.target.value)} />
                <Input value={editForm.brand} onChange={(e) => setEditField("brand", e.target.value)} />
                <Input type="number" value={editForm.price} onChange={(e) => setEditField("price", e.target.value)} />
                <Input type="number" value={editForm.stock} onChange={(e) => setEditField("stock", e.target.value)} />

                <Select value={editForm.categoryId ?? "none"} onValueChange={(v) => setEditField("categoryId", v === "none" ? null : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa kategori</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div>
                  <Label>Gambar baru (opsional)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setEditField("file", e.target.files?.[0] ?? null)} />
                </div>

                <Textarea rows={4} value={editForm.longDescription} onChange={(e) => setEditField("longDescription", e.target.value)} />

                <div className="flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={savingEdit}>
                    {savingEdit ? ".." : "Simpan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
