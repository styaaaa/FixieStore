// ============================
// Admin Dashboard (Final)
// ============================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, ListChecks, Menu, PlusCircle, RefreshCcw } from "lucide-react";
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

import AdminAddProduct from "@/pages/admin/AdminAddProduct";
import AdminMonitoring from "@/pages/admin/AdminMonitoring";
import AdminOrderStatus from "@/pages/admin/AdminOrderStatus";
import AdminProductList from "@/pages/admin/AdminProductList";
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
import type { DashboardView, ProductFormState } from "@/types/admin-dashboard";

// ============================
// Form State
// ============================

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

  const renderContent = () => {
    switch (activeView) {
      case "order-status":
        return (
          <AdminOrderStatus
            orders={orders}
            ordersLoading={ordersLoading}
            getNextStatus={getNextStatus}
            renderStatusBadge={renderStatusBadge}
            handleAdvanceStatus={handleAdvanceStatus}
            orderSaving={orderSaving}
            statusLabels={statusLabels}
            formatCurrency={formatCurrency}
          />
        );
      case "add-product":
        return (
          <AdminAddProduct
            categories={categories}
            form={form}
            saving={saving}
            onSubmit={handleCreate}
            onReset={() => setForm(initialForm)}
            setField={setField}
          />
        );
      case "product-table":
        return (
          <AdminProductList
            products={products}
            loading={loading}
            startEdit={startEdit}
            handleDelete={handleDelete}
            deleteLoading={deleteLoading}
          />
        );
      default:
        return (
          <AdminMonitoring
            categories={categories}
            products={products}
            inventoryValue={inventoryValue}
            lowStockProducts={lowStockProducts}
            activeOrders={activeOrders}
            completedOrders={completedOrders}
            onGoHome={() => navigate("/")}
            onLogout={() => navigate("/logout")}
            onAddProduct={() => navigateToView("add-product")}
            onViewProducts={() => navigateToView("product-table")}
            formatCurrency={formatCurrency}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-white to-amber-50 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="flex items-center gap-3 px-4 py-4 lg:hidden">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-slate-200 bg-white/80 text-slate-900 shadow-sm hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          onClick={toggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls="admin-sidebar"
        >
          <Menu className="h-5 w-5" />
          <span>{isSidebarOpen ? "Tutup Menu" : "Menu"}</span>
        </Button>

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
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
            "fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200/60 bg-slate-950 text-slate-100 shadow-xl transition-transform duration-200 ease-in-out dark:border-slate-800",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:static lg:w-full lg:border-r lg:shadow-none",
            isSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full lg:hidden"
          )}
        >
          <div className="flex h-full flex-col gap-6 px-4 py-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Application</p>
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
                    "w-full justify-start gap-3 rounded-xl bg-transparent px-3 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800/80",
                    activeView === id &&
                      "bg-slate-800/80 text-white shadow-inner shadow-primary/20"
                  )}
                  onClick={() => navigateToView(id)}
                  aria-current={activeView === id ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col items-start leading-tight">
                    <span>{label}</span>
                    <span className="text-xs text-slate-400">{description}</span>
                  </div>
                </Button>
              ))}
            </nav>

            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-slate-800 bg-slate-900 text-slate-100 hover:bg-slate-800"
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
              className="h-10 w-10 rounded-full border border-slate-200/60 bg-white/70 text-slate-700 shadow-sm hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              onClick={toggleSidebar}
              aria-expanded={isSidebarOpen}
              aria-controls="admin-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            </div>
          </div>
          {renderContent()}
        </main>
      </div>

      {editing && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl">
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
