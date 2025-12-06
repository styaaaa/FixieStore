import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import AdminAddProduct from "@/pages/admin/AdminAddProduct";
import AdminMonitoring from "@/pages/admin/AdminMonitoring";
import AdminOrderStatus from "@/pages/admin/AdminOrderStatus";
import AdminProductList from "@/pages/admin/AdminProductList";
import type { ProductFormState } from "@/types/admin-dashboard";
import type { Category, Product } from "@/types/catalog";
import type { Order, OrderStatus } from "@/types/order";

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

const statusFlow: Record<OrderStatus, OrderStatus | null> = {
  pending: "processed",
  processed: "packaged",
  packaged: "shipped",
  shipped: "completed",
  completed: null,
  failed: null,
  expired: null,
  cancelled: null,
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Menunggu",
  processed: "Diproses",
  packaged: "Dikemas",
  shipped: "Dikirim",
  completed: "Selesai",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

export default function AdminDashboard() {
  const [categories] = useState<Category[]>([
    { id: "cat-1", name: "Sepatu", slug: "sepatu" },
    { id: "cat-2", name: "Aksesori", slug: "aksesori" },
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: "prod-1",
      name: "Sneakers Alpha",
      brand: "Cosmic",
      price: 250000,
      stock: 8,
      imageUrl: "",
      description: "Sepatu lari ringan",
      longDescription: "Sepatu lari ringan dengan bantalan empuk.",
      categoryId: "cat-1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "prod-2",
      name: "Topi Nebula",
      brand: "Cosmic",
      price: 120000,
      stock: 3,
      imageUrl: "",
      description: "Topi nyaman untuk harian",
      longDescription: "Topi dengan bahan breathable.",
      categoryId: "cat-2",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "order-1",
      userId: "user-1",
      status: "processed",
      createdAt: new Date().toISOString(),
      paymentMethod: "cod",
      shippingMethod: "jne",
      totalPrice: 370000,
      firstName: "Aria",
      lastName: "Nova",
      phone: "08123456789",
      address: "Jl. Orbit 1",
      city: "Jakarta",
      postalCode: "10110",
    },
    {
      id: "order-2",
      userId: "user-2",
      status: "packaged",
      createdAt: new Date().toISOString(),
      paymentMethod: "bank_transfer",
      shippingMethod: "pos",
      totalPrice: 250000,
      firstName: "Rafi",
      lastName: "Andara",
      phone: "08987654321",
      address: "Jl. Galaxy 2",
      city: "Bandung",
      postalCode: "40111",
    },
  ]);

  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [ordersLoading, setOrdersLoading] = useState(false);

  const formatCurrency = (value?: number | null) => {
    if (value == null) return "-";
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  };

  const inventoryValue = useMemo(
    () => products.reduce((sum, product) => sum + product.price * product.stock, 0),
    [products]
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 5).length,
    [products]
  );

  const activeOrders = useMemo(
    () => orders.filter((order) => !["completed", "cancelled", "failed"].includes(order.status)).length,
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "completed").length,
    [orders]
  );

  const setField = (field: keyof ProductFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: form.name,
      brand: form.brand,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      description: form.description,
      longDescription: form.longDescription,
      imageUrl: "",
      categoryId: form.categoryId,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [...prev, newProduct]);
    setForm(initialForm);
    setSaving(false);
  };

  const startEdit = (product: Product) => {
    setForm({
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

  const handleDelete = (id: string) => {
    setDeleteLoading((prev) => ({ ...prev, [id]: true }));
    setProducts((prev) => prev.filter((product) => product.id !== id));
    setDeleteLoading((prev) => ({ ...prev, [id]: false }));
  };

  const getNextStatus = (status: OrderStatus) => statusFlow[status];

  const renderStatusBadge = (status: OrderStatus) => {
    const colorMap: Record<OrderStatus, string> = {
      pending: "bg-amber-100 text-amber-800",
      processed: "bg-blue-100 text-blue-800",
      packaged: "bg-indigo-100 text-indigo-800",
      shipped: "bg-sky-100 text-sky-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-rose-100 text-rose-800",
      expired: "bg-slate-100 text-slate-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorMap[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const handleAdvanceStatus = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    setOrdersLoading(true);
    setOrders((prev) =>
      prev.map((current) => (current.id === order.id ? { ...current, status: nextStatus } : current))
    );
    setOrdersLoading(false);
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-amber-50/40 to-white p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <AdminMonitoring
        categories={categories}
        products={products}
        inventoryValue={inventoryValue}
        lowStockProducts={lowStockProducts}
        activeOrders={activeOrders}
        completedOrders={completedOrders}
        onGoHome={() => window.location.assign("/")}
        onLogout={() => window.location.assign("/logout")}
        onAddProduct={() => window.location.assign("/admin/dashboard#add-product")}
        onViewProducts={() => window.location.assign("/admin/dashboard#product-table")}
        formatCurrency={formatCurrency}
      />

      <AdminOrderStatus
        orders={orders}
        ordersLoading={ordersLoading}
        getNextStatus={getNextStatus}
        renderStatusBadge={renderStatusBadge}
        handleAdvanceStatus={handleAdvanceStatus}
        orderSaving={{}}
        statusLabels={statusLabels}
        formatCurrency={formatCurrency}
      />

      <div id="add-product">
        <AdminAddProduct
          categories={categories}
          form={form}
          saving={saving}
          onSubmit={handleCreate}
          onReset={() => setForm(initialForm)}
          setField={setField}
        />
      </div>

      <div id="product-table">
        <AdminProductList
          products={products}
          loading={false}
          startEdit={startEdit}
          handleDelete={handleDelete}
          deleteLoading={deleteLoading}
        />
      </div>
    </div>
  );
}
