import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Box,
  PackagePlus,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import {
  createProduct,
  getCategories,
  getProducts,
  updateProductStock,
} from "@/lib/repositories/catalogRepository";
import type { Category, Product } from "@/types/catalog";

interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  stock: string;
  imageUrl: string;
  description: string;
  longDescription: string;
  categoryId: string;
}

const initialFormState: ProductFormState = {
  name: "",
  brand: "",
  price: "",
  stock: "0",
  imageUrl: "",
  description: "",
  longDescription: "",
  categoryId: "",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading, signOut } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(initialFormState);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [updatingStock, setUpdatingStock] = useState<Record<string, boolean>>({});

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  }, [navigate, signOut]);

  const syncStockDrafts = useCallback((inventory: Product[]) => {
    setStockDrafts((prev) => {
      const nextDrafts: Record<string, string> = { ...prev };
      inventory.forEach((product) => {
        nextDrafts[product.id] = String(product.stock ?? 0);
      });
      return nextDrafts;
    });
  }, []);

  const loadReferenceData = useCallback(async () => {
    try {
      const [categoryData, productData] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);

      setCategories(categoryData);
      setProducts(productData);
      syncStockDrafts(productData);
    } catch (error) {
      console.error("Gagal memuat data awal", error);
      toast({
        variant: "destructive",
        title: "Gagal memuat data",
        description: "Periksa koneksi Supabase atau coba lagi.",
      });
    } finally {
      setLoadingInventory(false);
    }
  }, [syncStockDrafts]);

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

    void loadReferenceData();
  }, [authLoading, isAdmin, loadReferenceData, navigate, user]);

  const handleFormChange = (field: keyof ProductFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      toast({
        variant: "destructive",
        title: "Nama produk wajib diisi",
        description: "Masukkan nama produk sebelum menyimpan.",
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
        categoryId: formState.categoryId || null,
      });

      setProducts((prev) => [newProduct, ...prev]);
      syncStockDrafts([newProduct, ...products]);
      setFormState(initialFormState);

      toast({
        title: "Produk ditambahkan",
        description: `${newProduct.name} berhasil disimpan ke katalog.`,
      });
    } catch (error) {
      console.error("Gagal membuat produk", error);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan produk",
        description: "Periksa kembali data produk atau coba beberapa saat lagi.",
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdateStock = async (productId: string) => {
    const draftValue = stockDrafts[productId];
    const nextStock = Number(draftValue);

    if (Number.isNaN(nextStock) || nextStock < 0) {
      toast({
        variant: "destructive",
        title: "Stok tidak valid",
        description: "Masukkan angka stok yang valid dan tidak negatif.",
      });
      return;
    }

    setUpdatingStock((prev) => ({ ...prev, [productId]: true }));

    try {
      const updated = await updateProductStock(productId, nextStock);
      setProducts((prev) => prev.map((product) => (product.id === productId ? updated : product)));
      toast({
        title: "Stok diperbarui",
        description: `${updated.name} sekarang memiliki stok ${updated.stock}.`,
      });
    } catch (error) {
      console.error("Gagal memperbarui stok", error);
      toast({
        variant: "destructive",
        title: "Tidak dapat memperbarui stok",
        description: "Silakan coba lagi atau muat ulang halaman.",
      });
    } finally {
      setUpdatingStock((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const inventoryValue = useMemo(
    () =>
      products.reduce((total, product) => {
        return total + product.price * product.stock;
      }, 0),
    [products],
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 5),
    [products],
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memuat dashboard admin</CardTitle>
            <CardDescription>Memverifikasi hak akses...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <Button variant="secondary" onClick={handleSignOut}>
              Keluar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan akun</CardTitle>
            <CardDescription>Kelola data toko dan pantau aktivitas produk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-background p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div className="rounded-lg border bg-background p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Peran</p>
                <p className="text-lg font-semibold">Administrator</p>
              </div>
              <div className="rounded-lg border bg-background p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                    Aktif
                  </Badge>
                  <span className="text-sm text-muted-foreground">Hak akses penuh</span>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/">Kelola katalog</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/">Pantau pesanan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>Tambah produk baru</CardTitle>
                  <CardDescription>Sesuaikan dengan skema produk di Supabase.</CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <PackagePlus className="h-4 w-4" />
                  Produk
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama produk</Label>
                    <Input
                      id="name"
                      value={formState.name}
                      onChange={(event) => handleFormChange("name", event.target.value)}
                      placeholder="Contoh: Sneaker Supreme"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formState.brand}
                      onChange={(event) => handleFormChange("brand", event.target.value)}
                      placeholder="Contoh: Supreme"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.price}
                      onChange={(event) => handleFormChange("price", event.target.value)}
                      placeholder="1500000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formState.stock}
                      onChange={(event) => handleFormChange("stock", event.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={formState.categoryId}
                      onValueChange={(value) => handleFormChange("categoryId", value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Pilih kategori (opsional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tanpa kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">URL gambar</Label>
                    <Input
                      id="image"
                      type="url"
                      value={formState.imageUrl}
                      onChange={(event) => handleFormChange("imageUrl", event.target.value)}
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi singkat</Label>
                  <Input
                    id="description"
                    value={formState.description}
                    onChange={(event) => handleFormChange("description", event.target.value)}
                    placeholder="Highlight fitur utama"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">Deskripsi panjang</Label>
                  <Textarea
                    id="longDescription"
                    value={formState.longDescription}
                    onChange={(event) => handleFormChange("longDescription", event.target.value)}
                    placeholder="Detail spesifikasi, material, ukuran, dll."
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCcw className="h-4 w-4" />
                    Produk akan langsung tersimpan di tabel Supabase.
                  </div>
                  <Button type="submit" disabled={savingProduct} className="min-w-[180px]">
                    {savingProduct ? "Menyimpan..." : "Simpan produk"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ringkasan inventaris</CardTitle>
              <CardDescription>Monitor performa stok dan nilai persediaan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-muted-foreground">Total produk</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-muted-foreground">Total stok</p>
                  <p className="text-2xl font-bold">{products.reduce((sum, product) => sum + product.stock, 0)}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-muted-foreground">Nilai inventaris</p>
                  <p className="text-2xl font-bold">
                    Rp {inventoryValue.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-muted-foreground">Stok rendah (&le; 5)</p>
                  <p className="text-2xl font-bold">{lowStockProducts.length}</p>
                </div>
              </div>

              {lowStockProducts.length > 0 && (
                <div className="rounded-lg border bg-amber-50 p-3 text-amber-900">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowUpRight className="h-4 w-4" />
                    Produk perlu restock
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    {lowStockProducts.slice(0, 3).map((product) => (
                      <p key={product.id} className="flex justify-between">
                        <span>{product.name}</span>
                        <span className="font-semibold">{product.stock} stok</span>
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
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar produk</CardTitle>
                <CardDescription>Update stok dan pantau detail produk.</CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Box className="h-4 w-4" />
                Inventaris
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingInventory ? (
              <div className="space-y-2">
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-background p-6 text-center text-sm text-muted-foreground">
                Belum ada produk. Tambahkan produk pertama Anda menggunakan formulir di atas.
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
                  {products.map((product) => {
                    const categoryLabel =
                      categories.find((category) => category.id === product.categoryId)?.name ?? "-";

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold">{product.name}</div>
                            <p className="text-sm text-muted-foreground">
                              {product.brand || "Tanpa brand"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[180px]">
                          <div className="text-sm text-muted-foreground line-clamp-1">{categoryLabel}</div>
                        </TableCell>
                        <TableCell>
                          Rp {product.price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={stockDrafts[product.id] ?? product.stock}
                              onChange={(event) =>
                                setStockDrafts((prev) => ({ ...prev, [product.id]: event.target.value }))
                              }
                              className="w-24"
                            />
                            <Badge variant={product.stock <= 5 ? "destructive" : "outline"}>
                              {product.stock <= 5 ? "Rendah" : "Aman"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStock(product.id)}
                              disabled={updatingStock[product.id]}
                            >
                              {updatingStock[product.id] ? "Menyimpan..." : "Simpan stok"}
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
    </div>
  );
};

export default AdminDashboard;
