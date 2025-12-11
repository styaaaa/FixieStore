import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartLoading, updateQuantity, removeFromCart, clearCart, refreshCart, cartCount } =
    useCart();

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    setSelectedItemIds((previous) => {
      const currentIds = cartItems.map((item) => item.id);
      const preservedSelection = previous.filter((id) => currentIds.includes(id));
      const newItems = currentIds.filter((id) => !previous.includes(id));

      return [...preservedSelection, ...newItems];
    });
  }, [cartItems]);

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedItemIds.includes(item.id)),
    [cartItems, selectedItemIds]
  );

  const totalPrice = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + (item.product?.price ?? 0) * item.quantity,
        0
      ),
    [selectedItems]
  );

  const hasInsufficientStock = useMemo(
    () => selectedItems.some((item) => (item.product?.stock ?? 0) < item.quantity),
    [selectedItems]
  );

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedItemIds(cartItems.map((item) => item.id));
      return;
    }

    setSelectedItemIds([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto flex items-center gap-3 px-4 py-5">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Keranjang</p>
              <h1 className="text-xl font-semibold">Masuk untuk melanjutkan</h1>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-10">
          <Card className="mx-auto max-w-2xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Selamat datang kembali</CardTitle>
              <CardDescription>
                Masuk atau daftar terlebih dahulu agar kami bisa menyimpan keranjang belanja
                kamu di Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/login">Masuk</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register">Daftar akun baru</Link>
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")}>
                Kembali berbelanja
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Keranjang</p>
              <h1 className="text-xl font-semibold">Koleksi pilihan kamu</h1>
              <p className="text-sm text-muted-foreground">{cartCount} item tersimpan</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">Lanjut belanja</Link>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle>Ringkasan Keranjang</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedItems.length} dipilih untuk checkout
                </p>
              </div>
              {cartItems.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={selectedItemIds.length === cartItems.length && cartItems.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Pilih semua item"
                    />
                    <span>Pilih semua</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void clearCart()} disabled={cartLoading}>
                    <Trash2 className="mr-2 h-4 w-4" /> Bersihkan
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              {cartLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex gap-4">
                      <Skeleton className="h-24 w-24 rounded-xl" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/70 bg-card/30 p-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Keranjang masih kosong</h3>
                    <p className="text-sm text-muted-foreground">
                      Temukan produk favoritmu dan tambahkan ke keranjang untuk melanjutkan.
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/">Mulai belanja</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item, index) => {
                    const availableStock = item.product?.stock ?? 0;
                    const isOutOfStock = availableStock === 0;
                    const exceedsStock = availableStock < item.quantity;

                    return (
                      <div key={item.id} className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedItemIds.includes(item.id)}
                              onCheckedChange={() => toggleItemSelection(item.id)}
                              aria-label={`Pilih ${item.product?.name ?? "produk"}`}
                              className="mt-1"
                            />
                            <div className="h-24 w-28 overflow-hidden rounded-xl bg-muted sm:h-28">
                              {item.product?.imageUrl ? (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <ShoppingBag className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-primary">Produk #{index + 1}</p>
                                <h3 className="text-lg font-semibold leading-tight">
                                  {item.product?.name ?? "Produk tanpa nama"}
                                </h3>
                                {item.product?.brand && (
                                  <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                                )}
                                <p className="text-xs font-medium text-muted-foreground">
                                  Stok tersedia: {availableStock}
                                </p>
                                {(isOutOfStock || exceedsStock) && (
                                  <p className="text-xs font-medium text-destructive">
                                    {isOutOfStock
                                      ? "Stok habis, silakan hapus produk ini"
                                      : "Jumlah melebihi stok yang tersedia"}
                                  </p>
                                )}
                              </div>
                              <p className="text-lg font-bold text-primary">
                                {formatCurrency((item.product?.price ?? 0) * item.quantity)}
                              </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-2 rounded-full border bg-background px-2 py-1 shadow-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || cartLoading}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="min-w-[3rem] text-center text-sm font-medium">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                                  disabled={cartLoading || isOutOfStock || item.quantity >= availableStock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void removeFromCart(item.id)}
                                  disabled={cartLoading}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Rincian Pembayaran</CardTitle>
              <CardDescription>Pantau total biaya sebelum checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Ongkos kirim</span>
                  <span>Ditentukan saat checkout</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedItems.length === 0 || cartLoading || hasInsufficientStock}
                  onClick={() =>
                    navigate("/checkout", {
                      state: { selectedCartItemIds: selectedItemIds },
                    })
                  }
                >
                  Lanjut ke checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                  Cari produk lain
                </Button>
                {hasInsufficientStock && (
                  <p className="text-center text-sm font-medium text-destructive">
                    Checkout tidak tersedia karena ada item yang stoknya habis atau kurang.
                  </p>
                )}
                {selectedItems.length === 0 && cartItems.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Pilih minimal satu produk untuk melanjutkan checkout.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Cart;
