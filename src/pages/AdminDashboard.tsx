// ============================
// Admin Dashboard (Final)
// ============================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  ShieldCheck,
  RefreshCcw,
  Home,
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

  if (!user || !isAdmin) return null;

  const inventoryValue = useMemo(
    () => products.reduce((s, p) => s + p.price * p.stock, 0),
    [products]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6">

        {/* Left buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Home
          </Button>
        </div>

        {/* Right button */}
        <Button variant="destructive" onClick={() => navigate("/logout")}>
          Keluar
        </Button>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-1">
        Dashboard Admin
        <Badge variant="secondary">
          <ShieldCheck className="h-4 w-4" /> Admin
        </Badge>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Kelola produk & stok</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status Pesanan</CardTitle>
          <CardDescription>
            Pending → processed → packaged → shipped → completed. Tanpa integrasi kurir.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Belum ada pesanan.
            </div>
          ) : (
            <Table>
              <TableHeader>
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

                      <TableCell>{formatCurrency(order.totalPrice)}</TableCell>

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
          )}
        </CardContent>
      </Card>

      {/* ADD PRODUCT */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tambah Produk</CardTitle>
          <CardDescription>Upload gambar ke Supabase Storage</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">

            <div className="grid md:grid-cols-2 gap-4">
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

            <div>
              <Label>Gambar</Label>
              <Input type="file" accept="image/*" onChange={(e) => setField("file", e.target.files?.[0] ?? null)} />
            </div>

            <Input placeholder="Deskripsi singkat" value={form.description} onChange={(e) => setField("description", e.target.value)} />
            <Textarea rows={4} placeholder="Deskripsi panjang" value={form.longDescription} onChange={(e) => setField("longDescription", e.target.value)} />

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" /> Data disimpan otomatis.
              </p>

              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Tambah"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* PRODUCT TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Total nilai inventaris: Rp {inventoryValue.toLocaleString("id-ID")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? <p>Memuat...</p> : (
            <Table>
              <TableHeader>
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
  );
}
