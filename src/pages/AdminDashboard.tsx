// ============================
// Admin Dashboard (Final)
// ============================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ClipboardList,
  Home,
  RefreshCcw,
  LogOut,
  Pencil,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Package,
  CheckCircle2,
} from "lucide-react";

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
  SelectItem
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

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
  stock: "0",
  description: "",
  longDescription: "",
  categoryId: null,
  file: null,
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


  // ============================
  // Load Data
  // ============================

  const loadData = useCallback(async () => {
    try {
      setOrdersLoading(true);

      const [cats, prods, adminOrders] = await Promise.all([
        getCategories(),
        getProducts(),
        fetchAllOrders(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setOrders(adminOrders);
    } catch {
      toast({ variant: "destructive", title: "Gagal memuat data" });
    } finally {
      setLoading(false);
      setOrdersLoading(false);
    }
  }, []);

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
        (payload) => {
          setOrders((current) => {
            const mapped = mapOrderRowToOrder((payload.new ?? payload.old) as any);

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
  }, [isAdmin, user]);


  // ============================
  // Helpers
  // ============================

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
  // Render
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* HERO */}
        <div className="overflow-hidden rounded-3xl border bg-white/60 shadow-lg backdrop-blur">
          <div className="grid gap-6 bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 md:grid-cols-[1.2fr,1fr] md:items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                Mode Admin Aktif
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold leading-tight">Dashboard Admin</h1>
                <Badge variant="secondary">Terproteksi</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Pantau pesanan terbaru, perbarui status pengiriman, dan kelola inventaris dalam satu tampilan yang lebih rapi.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default" onClick={() => navigate("/")} className="shadow-sm">
                  <Home className="mr-2 h-4 w-4" />
                  Kembali ke Home
                </Button>
                <Button variant="secondary" onClick={() => navigate("/dashboard")}>Dashboard User</Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-white/70 p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>Kontrol Cepat</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Aktif
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start gap-2" onClick={() => navigate("/logout")}> 
                  <LogOut className="h-4 w-4" /> Keluar
                </Button>
                <Button variant="outline" className="justify-start gap-2" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  <ClipboardList className="h-4 w-4" /> Pesanan
                </Button>
                <Button variant="outline" className="justify-start gap-2" onClick={() => document.getElementById("add-product")?.scrollIntoView({ behavior: "smooth" })}>
                  <Package className="h-4 w-4" /> Produk
                </Button>
                <Button variant="outline" className="justify-start gap-2" onClick={() => document.getElementById("product-table")?.scrollIntoView({ behavior: "smooth" })}>
                  <TrendingUp className="h-4 w-4" /> Inventaris
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-primary/10 bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Inventaris</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(inventoryValue)}</div>
              <p className="text-xs text-muted-foreground">Harga x stok seluruh produk</p>
            </CardContent>
          </Card>

          <Card className="border bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Kategori aktif: {categories.length || "-"}</p>
            </CardContent>
          </Card>

          <Card className="border bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">Produk dengan stok ≤ 5 unit</p>
            </CardContent>
          </Card>

          <Card className="border bg-white/80 shadow-sm">
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

        <Card className="border border-primary/10 bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">Status Pesanan</CardTitle>
                <CardDescription>
                  Pending → processed → packaged → shipped → completed. Tanpa integrasi kurir.
                </CardDescription>
              </div>
              <Badge variant="secondary">Realtime</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {ordersLoading ? (
              <div className="space-y-3">
                <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
                Belum ada pesanan.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>ID & Tanggal</TableHead>
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
                        <TableRow key={order.id}>
                          <TableCell>
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString("id-ID")}
                            </p>
                          </TableCell>

                          <TableCell>
                            <p className="font-medium">
                              {[order.firstName, order.lastName].filter(Boolean).join(" ") || "Nama belum diisi"}
                            </p>
                            <p className="text-xs text-muted-foreground">{order.city || "Kota belum diisi"}</p>
                          </TableCell>

                          <TableCell>{renderStatusBadge(order.status)}</TableCell>

                          <TableCell className="font-medium">{formatCurrency(order.totalPrice)}</TableCell>

                          <TableCell className="text-right">
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
                              <Badge variant="outline">Completed</Badge>
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

        {/* ADD PRODUCT */}
        <Card id="add-product" className="border bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">Tambah Produk</CardTitle>
                <CardDescription>Upload gambar ke Supabase Storage</CardDescription>
              </div>
              <Badge variant="secondary">Inventaris</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input placeholder="Nama" value={form.name} onChange={(e) => setField("name", e.target.value)} />
                <Input placeholder="Brand" value={form.brand} onChange={(e) => setField("brand", e.target.value)} />

                <Input type="number" placeholder="Harga" value={form.price} onChange={(e) => setField("price", e.target.value)} />
                <Input type="number" placeholder="Stok" value={form.stock} onChange={(e) => setField("stock", e.target.value)} />

                <Select value={form.categoryId ?? "none"} onValueChange={(v) => setField("categoryId", v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa kategori</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
                  <Label className="text-sm font-medium">Gambar</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setField("file", e.target.files?.[0] ?? null)} />
                  <p className="text-xs text-muted-foreground">Format JPG/PNG. Maksimal 5MB.</p>
                </div>

                <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
                  <Label className="text-sm font-medium">Deskripsi singkat</Label>
                  <Input placeholder="Ringkasan produk" value={form.description} onChange={(e) => setField("description", e.target.value)} />
                  <Label className="text-sm font-medium">Deskripsi panjang</Label>
                  <Textarea rows={4} placeholder="Detail fitur & material" value={form.longDescription} onChange={(e) => setField("longDescription", e.target.value)} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/30 px-4 py-3">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" /> Data disimpan otomatis ketika berhasil.
                </p>

                <Button type="submit" disabled={saving} className="min-w-[140px]">
                  {saving ? "Menyimpan..." : "Tambah Produk"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* PRODUCT TABLE */}
        <Card id="product-table" className="border bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Daftar Produk</CardTitle>
                <CardDescription>
                  Total nilai inventaris: Rp {inventoryValue.toLocaleString("id-ID")}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-primary">Perbarui secara berkala</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? <p>Memuat...</p> : (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>

                        <TableCell>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{p.brand}</p>
                        </TableCell>

                        <TableCell>Rp {p.price.toLocaleString("id-ID")}</TableCell>

                        <TableCell>
                          <Badge variant={p.stock <= 5 ? "destructive" : "outline"}>
                            {p.stock} unit
                          </Badge>
                        </TableCell>

                        <TableCell className="flex gap-2 justify-end">

                          {/* EDIT */}
                          <Button size="sm" variant="secondary" onClick={() => startEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* DELETE */}
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


      {/* EDIT MODAL */}
      {editing && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm p-4">
          <Card className="max-w-xl w-full">
            <CardHeader><CardTitle>Edit Produk</CardTitle></CardHeader>

            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">

                <Input value={editForm.name} onChange={(e) => setEditField("name", e.target.value)} />
                <Input value={editForm.brand} onChange={(e) => setEditField("brand", e.target.value)} />
                <Input type="number" value={editForm.price} onChange={(e) => setEditField("price", e.target.value)} />
                <Input type="number" value={editForm.stock} onChange={(e) => setEditField("stock", e.target.value)} />

                <Select value={editForm.categoryId ?? "none"} onValueChange={(v) => setEditField("categoryId", v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa kategori</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div>
                  <Label>Gambar baru (opsional)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setEditField("file", e.target.files?.[0] ?? null)} />
                </div>

                <Textarea rows={4} value={editForm.longDescription} onChange={(e) => setEditField("longDescription", e.target.value)} />

                <div className="flex justify-between items-center">
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>Batal</Button>
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
    </div>
  );
}
