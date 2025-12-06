import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { Product } from "@/types/catalog";

interface AdminProductListProps {
  products: Product[];
  loading: boolean;
  startEdit: (product: Product) => void;
  handleDelete: (id: string) => void;
  deleteLoading: Record<string, boolean>;
}

export function AdminProductList({ products, loading, startEdit, handleDelete, deleteLoading }: AdminProductListProps) {
  return (
    <Card className="border border-amber-200/70 bg-white/85 shadow-sm shadow-amber-200/40 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Daftar Produk</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-amber-100/80 shadow-sm dark:border-slate-800">
            <Table className="text-sm">
              <TableHeader className="bg-gradient-to-r from-white to-amber-50/70 text-slate-700 dark:from-slate-900 dark:to-slate-900/80 dark:text-slate-200">
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
                    className="align-middle transition hover:bg-primary/5 dark:hover:bg-slate-800"
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
                        className="border-amber-200/70 bg-white/90 text-primary shadow-sm hover:border-primary/40 hover:text-primary/80 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
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
}

export default AdminProductList;
