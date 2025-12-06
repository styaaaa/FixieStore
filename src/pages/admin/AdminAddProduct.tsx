import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import type { Category } from "@/types/catalog";
import type { ProductFormState } from "@/types/admin-dashboard";

interface AdminAddProductProps {
  categories: Category[];
  form: ProductFormState;
  saving: boolean;
  onSubmit: (event: any) => void;
  onReset: () => void;
  setField: (field: keyof ProductFormState, value: any) => void;
}

export function AdminAddProduct({ categories, form, saving, onSubmit, onReset, setField }: AdminAddProductProps) {
  return (
    <Card className="border border-amber-200/70 bg-white/85 shadow-sm shadow-amber-200/40 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Tambah Produk</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Produk</Label>
              <Input
                placeholder="Contoh: Sneakers Alpha"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Brand</Label>
              <Input
                placeholder="Contoh: HyperX"
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
                placeholder="250000"
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
                  <SelectItem value="none">Tanpa kategori</SelectItem>
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
              onClick={onReset}
              className="border-amber-200/70"
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
}

export default AdminAddProduct;
