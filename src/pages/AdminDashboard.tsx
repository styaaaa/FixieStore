// ============================
// Admin Dashboard Refactored
// ============================

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowUpRight,
  Pencil,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

import { useAuth } from "@/context/auth-context";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "@/lib/repositories/catalogRepository";
import type { Category, Product } from "@/types/catalog";

// ============================
// Initial Form State
// ============================

interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  stock: string;
  imageUrl: string;
  description: string;
  longDescription: string;
  categoryId: string | null;
}

const initialFormState: ProductFormState = {
  name: "",
  brand: "",
  price: "",
  stock: "0",
  imageUrl: "",
  description: "",
  longDescription: "",
  categoryId: null,
};

// ============================
// Main Component
// ============================

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading, signOut } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(initialFormState);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormState, setEditFormState] = useState<ProductFormState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Record<string, boolean>>({});

  // ============================
  // Auth + Load Data
  // ============================

  const loadReferenceData = useCallback(async () => {
    try {
      const [categoryData, productData] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);

      setCategories(categoryData);
      setProducts(productData);
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal memuat data",
        description: "Periksa koneksi Supabase atau coba lagi.",
      });
    } finally {
      setLoadingInventory(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }

    void loadReferenceData();
  }, [authLoading, isAdmin, user, navigate, loadReferenceData]);

  // ============================
  // Utilities
  // ============================

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch {
      console.error("Gagal keluar");
    }
  };

  const handleFormChange = (field: keyof ProductFormState, value: string | null) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // ============================
  // Create Product
  // ============================

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      toast({
        variant: "destructive",
        title: "Nama produk wajib diisi",
      });
      return;
    }

    const price = Number(formState.price);
    const stock = Number(formState.stock);

    if (Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
      toast({
        variant: "destructive",
        title: "Input tidak valid",
        description: "Harga dan stok harus berupa angka positif.",
      });
      return;
    }

    setSavingProduct(true);

    try {
      const newProduct = await createProduct({
        name: formState.name.trim(),
        brand: formState.brand.trim(),
        price,
        stock,
        imageUrl: formState.imageUrl.trim(),
        description: formState.description.trim(),
        longDescription: formState.longDescription.trim(),
        categoryId: formState.categoryId === "none" ? null : formState.categoryId,
      });

      setProducts((prev) => [newProduct, ...prev]);

      setFormState(initialFormState);

      toast({
        title: "Produk ditambahkan",
        description: `${newProduct.name} berhasil disimpan.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal menyimpan produk",
      });
    } finally {
      setSavingProduct(false);
    }
  };

  // ============================
  // Edit Product
  // ============================

  const startEditingProduct = (product: Product) => {
    setEditingProduct(product);
    setEditFormState({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl,
      description: product.description,
      longDescription: product.longDescription,
      categoryId: product.categoryId,
    });
  };

  const handleEditFormChange = (
    field: keyof ProductFormState,
    value: string | null,
  ) => {
    setEditFormState((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleUpdateProduct = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingProduct || !editFormState) return;

    if (!editFormState.name.trim()) {
      toast({
        variant: "destructive",
        title: "Nama produk wajib diisi",
      });
      return;
    }

    const price = Number(editFormState.price);
    const stock = Number(editFormState.stock);

    if (Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
      toast({
        variant: "destructive",
        title: "Input tidak valid",
        description: "Harga dan stok harus berupa angka positif.",
      });
      return;
    }

    setSavingEdit(true);

    try {
      const updated = await updateProduct(editingProduct.id, {
        name: editFormState.name.trim(),
        brand: editFormState.brand.trim(),
        price,
        stock,
        imageUrl: editFormState.imageUrl.trim(),
        description: editFormState.description.trim(),
        longDescription: editFormState.longDescription.trim(),
        categoryId:
          editFormState.categoryId === "none"
            ? null
            : editFormState.categoryId,
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      toast({
        title: "Produk diperbarui",
        description: `${updated.name} berhasil diupdate.`,
      });

      setEditingProduct(null);
      setEditFormState(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Tidak dapat memperbarui produk",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // ============================
  // Delete Product
  // ============================

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProduct((prev) => ({ ...prev, [productId]: true }));

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast({
        title: "Produk dihapus",
        description: "Item sudah tidak tersedia di katalog.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal menghapus produk",
      });
    } finally {
      setDeletingProduct((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ============================
  // Derived Values
  // ============================

  const inventoryValue = useMemo(
    () => products.reduce((sum, p) => sum + p.price * p.stock, 0),
    [products]
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= 5),
    [products]
  );

  // ============================
  // RENDER
  // ============================

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memuat dashboard admin</CardTitle>
            <CardDescription>Memverifikasi hak akses...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ============================
  // UI START
  // ============================

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Akses admin terverifikasi</p>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Dashboard Admin</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>Lihat toko</Button>
            <Button variant="secondary" onClick={handleSignOut}>Keluar</Button>
          </div>
        </div>

        {/* CARD: Add Product */}
        <Card>
          <CardHeader>
            <CardTitle>Tambah produk baru</CardTitle>
            <CardDescription>Pastikan sesuai skema produk Supabase.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProduct} className="space-y-4">

              {/* FORM GRID */}
              <div className="grid gap-4 md:grid-cols-2">

                <div className="space-y-2">
                  <Label>Nama produk</Label>
                  <Input value={formState.name} onChange={(e) => handleFormChange("name", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input value={formState.brand} onChange={(e) => handleFormChange("brand", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Harga</Label>
                  <Input type="number" min="0" value={formState.price} onChange={(e) => handleFormChange("price", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input type="number" min="0" value={formState.stock} onChange={(e) => handleFormChange("stock", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={formState.categoryId ?? "none"}
                    onValueChange={(value) =>
                      handleFormChange("categoryId", value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa kategori</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>URL Gambar</Label>
                  <Input type="url" value={formState.imageUrl} onChange={(e) => handleFormChange("imageUrl", e.target.value)} />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Label>Deskripsi singkat</Label>
                <Input value={formState.description} onChange={(e) => handleFormChange("description", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi panjang</Label>
                <Textarea rows={4} value={formState.longDescription} onChange={(e) => handleFormChange("longDescription", e.target.value)} />
              </div>

              {/* SUBMIT */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" /> Produk akan tersimpan langsung.
                </div>
                <Button type="submit" disabled={savingProduct}>
                  {savingProduct ? "Menyimpan…" : "Tambah produk"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* INVENTORY SUMMARY */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan inventaris</CardTitle>
            <CardDescription>Monitor stok dan performa katalog.</CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* Inventory Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">

              <div className="border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Total Produk</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>

              <div className="border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Total Stok</p>
                <p className="text-2xl font-bold">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </p>
              </div>

              <div className="border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Nilai Inventaris</p>
                <p className="text-2xl font-bold">Rp {inventoryValue.toLocaleString("id-ID")}</p>
              </div>

              <div className="border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Stok Rendah (≤ 5)</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>

            </div>

            {/* Low Stock Warning */}
            {lowStockProducts.length > 0 && (
              <div className="rounded-lg border bg-amber-50 p-3 text-amber-900">
                <div className="font-semibold flex items-center gap-2 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  Produk stok rendah
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  {lowStockProducts.slice(0, 3).map((p) => (
                    <p key={p.id} className="flex justify-between">
                      <span>{p.name}</span>
                      <span className="font-semibold">{p.stock} stok</span>
                    </p>
                  ))}

                  {lowStockProducts.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{lowStockProducts.length - 3} produk lainnya
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRODUCT TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
            <CardDescription>Kelola stok dan data katalog.</CardDescription>
          </CardHeader>

          <CardContent>
            {loadingInventory ? (
              <p>Memuat...</p>
            ) : products.length === 0 ? (
              <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground">
                Belum ada produk. Tambahkan via formulir di atas.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.map((p) => {
                    const categoryLabel =
                      categories.find((c) => c.id === p.categoryId)?.name ??
                      "-";

                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {p.brand || "Tanpa brand"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>{categoryLabel}</TableCell>

                        <TableCell>
                          Rp {p.price.toLocaleString("id-ID")}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={p.stock <= 5 ? "destructive" : "outline"}>
                              {p.stock <= 5 ? "Rendah" : "Aman"}
                            </Badge>
                            <span className="font-semibold">{p.stock} unit</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => startEditingProduct(p)}
                              className="flex items-center gap-1"
                            >
                              <Pencil className="h-4 w-4" />
                              Update
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(p.id)}
                              disabled={deletingProduct[p.id]}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletingProduct[p.id] ? "Menghapus…" : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>

      <Dialog
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
            setEditFormState(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit produk</DialogTitle>
            <DialogDescription>
              Perbarui data produk tanpa perlu menggulir pada tabel. Semua perubahan
              akan langsung tersinkronisasi dengan Supabase.
            </DialogDescription>
          </DialogHeader>

          {editFormState && (
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama produk</Label>
                  <Input
                    value={editFormState.name}
                    onChange={(e) => handleEditFormChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input
                    value={editFormState.brand}
                    onChange={(e) => handleEditFormChange("brand", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Harga</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editFormState.price}
                    onChange={(e) => handleEditFormChange("price", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editFormState.stock}
                    onChange={(e) => handleEditFormChange("stock", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={editFormState.categoryId ?? "none"}
                    onValueChange={(value) =>
                      handleEditFormChange(
                        "categoryId",
                        value === "none" ? null : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa kategori</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>URL Gambar</Label>
                  <Input
                    type="url"
                    value={editFormState.imageUrl}
                    onChange={(e) => handleEditFormChange("imageUrl", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deskripsi singkat</Label>
                <Input
                  value={editFormState.description}
                  onChange={(e) => handleEditFormChange("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi panjang</Label>
                <Textarea
                  rows={4}
                  value={editFormState.longDescription}
                  onChange={(e) => handleEditFormChange("longDescription", e.target.value)}
                />
              </div>

              <DialogFooter className="sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Pastikan detail produk sesuai sebelum menekan update.
                </p>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit ? "Mengupdate…" : "Update produk"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
