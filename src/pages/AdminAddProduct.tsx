import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useAuth } from "@/context/auth-context";
import { createProduct, getCategories } from "@/lib/repositories/catalogRepository";
import type { Category } from "@/types/catalog";
import { Button } from "@/components/ui/button";

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

const AdminAddProduct = () => {
  const { user, isAdmin, authLoading, signOut } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formState, setFormState] = useState<ProductFormState>(initialFormState);
  const [savingProduct, setSavingProduct] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      toast({
        variant: "destructive",
        title: "Tidak dapat mengakses halaman",
      });
    }
  }, [authLoading, isAdmin, user]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await getCategories();
        setCategories(categoryData);
      } catch {
        toast({
          variant: "destructive",
          title: "Gagal memuat kategori",
          description: "Periksa koneksi Supabase atau coba lagi.",
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      console.error("Gagal keluar");
    }
  };

  const handleFormChange = (field: keyof ProductFormState, value: string | null) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

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

  if (authLoading || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memuat halaman admin</CardTitle>
            <CardDescription>Menyiapkan data...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminPageLayout
      title="Tambah produk"
      description="Formulir khusus untuk menambahkan item baru ke katalog."
      onSignOut={handleSignOut}
      actions={
        <Button variant="ghost" asChild>
          <Link to="/admin/monitoring">Ke monitoring</Link>
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Tambah produk baru</CardTitle>
          <CardDescription>Pastikan sesuai skema produk Supabase.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProduct} className="space-y-4">
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
                  onValueChange={(value) => handleFormChange("categoryId", value === "none" ? null : value)}
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

            <div className="space-y-2">
              <Label>Deskripsi singkat</Label>
              <Input value={formState.description} onChange={(e) => handleFormChange("description", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi panjang</Label>
              <Textarea rows={4} value={formState.longDescription} onChange={(e) => handleFormChange("longDescription", e.target.value)} />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Produk akan tersimpan langsung.</p>
              <Button type="submit" disabled={savingProduct}>
                {savingProduct ? "Menyimpan…" : "Tambah produk"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
};

export default AdminAddProduct;
