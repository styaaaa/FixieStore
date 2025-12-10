// src/pages/Checkout.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useUserProfile } from "@/hooks/useUserProfile";
import { decreaseProductStock } from "@/lib/repositories/catalogRepository";
import { createOrder, updateOrderStatus } from "@/lib/repositories/orderRepository";
import { createMidtransTransaction } from "@/lib/repositories/paymentRepository";
import { supabase } from "@/lib/supabaseClient";
import { savePurchasedProducts } from "@/lib/repositories/reviewRepository";
import type { Product } from "@/types/catalog";
import type { CartItem } from "@/types/cart";

// ==== Deklarasi global Midtrans Snap ====
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authLoading } = useAuth();
  const { cartItems, cartLoading, refreshCart, removeFromCart } = useCart();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);

  const locationState =
    (location.state as
      | { directPurchase?: { product: Product; quantity: number }; selectedCartItemIds?: string[] }
      | null) ?? null;

  const directPurchase = locationState?.directPurchase;
  const selectedCartItemIds = useMemo(
    () => locationState?.selectedCartItemIds ?? [],
    [locationState]
  );

  const purchaseItems: CartItem[] = useMemo(() => {
    if (directPurchase) {
      const { product, quantity } = directPurchase;
      return [
        {
          id: `direct-${product.id}`,
          productId: product.id,
          quantity,
          createdAt: new Date().toISOString(),
          product,
        },
      ];
    }

    if (selectedCartItemIds.length > 0) {
      const filtered = cartItems.filter((item) => selectedCartItemIds.includes(item.id));
      return filtered.length > 0 ? filtered : cartItems;
    }

    return cartItems;
  }, [cartItems, directPurchase, selectedCartItemIds]);

  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod] = useState("Transfer Bank");
  const [shippingMethod, setShippingMethod] = useState("Reguler");

  // ====== Load keranjang ======
  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  // ====== Load script Midtrans Snap ======
  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    if (!clientKey) {
      console.warn("VITE_MIDTRANS_CLIENT_KEY belum diset di .env");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const totalPrice = useMemo(
    () =>
      purchaseItems.reduce(
        (total, item) => total + (item.product?.price ?? 0) * item.quantity,
        0
      ),
    [purchaseItems]
  );

  const profileFullName = useMemo(
    () => profile?.full_name?.trim() || (user?.user_metadata as Record<string, string> | undefined)?.full_name?.trim() || "",
    [profile?.full_name, user?.user_metadata]
  );

  const profilePhone = profile?.phone?.trim() ?? "";
  const profileAddress = profile?.address?.trim() ?? "";
  const profileCity = profile?.city?.trim() ?? "";
  const profilePostalCode = profile?.postal_code?.trim() ?? "";

  const [derivedFirstName, derivedLastName] = useMemo(() => {
    if (!profileFullName) return ["", ""];

    const [first, ...rest] = profileFullName.split(" ");
    const last = rest.join(" ").trim();

    return [first || profileFullName, last || first || "Customer"];
  }, [profileFullName]);

  const missingProfileFields = useMemo(() => {
    const missing: string[] = [];

    if (!profileFullName) missing.push("Nama lengkap");
    if (!profilePhone) missing.push("Nomor telepon");
    if (!profileAddress) missing.push("Alamat lengkap");
    if (!profileCity) missing.push("Kota / Kabupaten");
    if (!profilePostalCode) missing.push("Kode pos");

    return missing;
  }, [profileAddress, profileCity, profileFullName, profilePhone, profilePostalCode]);

  const hasInsufficientStock = useMemo(
    () => purchaseItems.some((item) => (item.product?.stock ?? 0) < item.quantity),
    [purchaseItems]
  );


  // ====== Validasi stok sebelum buat order ======
  const validateStock = () => {
    const unavailableItem = purchaseItems.find((item) => {
      const availableStock = item.product?.stock ?? 0;
      return availableStock < item.quantity;
    });

    if (!unavailableItem) return true;

    const productName = unavailableItem.product?.name ?? "produk";
    const sisa = unavailableItem.product?.stock ?? 0;

    toast.error("Stok tidak mencukupi", {
      description: `${productName} hanya tersisa ${sisa} unit`,
    });

    return false;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Silakan masuk untuk melanjutkan checkout");
      navigate("/login");
      return;
    }

    if (purchaseItems.length === 0) {
      toast.error("Tidak ada produk untuk checkout");
      return;
    }

    if (!validateStock()) return;

    if (profileLoading) {
      toast.info("Sedang memuat data profil. Coba lagi sesaat lagi.");
      return;
    }

    if (missingProfileFields.length > 0) {
      toast.error("Lengkapi informasi penerima", {
        description: "Perbarui detail profilmu sebelum melanjutkan checkout.",
      });
      navigate("/dashboard/profile");
      return;
    }

    setSubmitting(true);

    try {
    const productSummary = purchaseItems
        .filter((item) => item.product)
        .map((item) => {
          const name = item.product?.name ?? item.productId;
          return item.quantity > 1 ? `${name} x${item.quantity}` : name;
        })
        .filter(Boolean)
        .join(", ");

      //Buat order pending
      const order = await createOrder({
        userId: user.id,
        paymentMethod,
        shippingMethod,
        productName: productSummary || undefined,
        totalPrice,
        firstName: derivedFirstName,
        lastName: derivedLastName,
        phone: profilePhone,
        address: profileAddress,
        city: profileCity,
        postalCode: profilePostalCode,
      });

      //Minta token Midtrans ke Edge Function supabase
      if (!window.snap) {
        toast.error("Layanan pembayaran belum siap. Coba beberapa saat lagi.");
        return;
      }

        const midtransData = await createMidtransTransaction({
          orderId: order.id,
          grossAmount: totalPrice,
          customerDetails: {
            first_name: derivedFirstName,
            last_name: derivedLastName,
            phone: profilePhone,
            address: `${profileAddress}, ${profileCity} ${profilePostalCode}`,
            email: user.email,
          },
        });

        //Midtrans Snap popup
        window.snap.pay(midtransData.token, {
          onSuccess: async () => {
            try {
              // update status ke processed (fallback jika webhook sudah handle)
              await updateOrderStatus(order.id, "processed");

              // simpan produk yang berhasil dibeli untuk referensi ulasan
              savePurchasedProducts(order.id, purchaseItems);

              // kurangi stok dan bersihkan cart
              await Promise.all(
                purchaseItems.map((item) =>
                  decreaseProductStock(item.productId, item.quantity)
                )
              );
              if (!directPurchase) {
                await Promise.all(purchaseItems.map((item) => removeFromCart(item.id)));
              }

              toast.success("Pembayaran berhasil", {
                description: "Terima kasih sudah berbelanja di FixieStore.",
              });
            } catch (err) {
              console.error("Sync setelah bayar gagal:", err);
            }

            navigate(`/order-success?order_id=${order.id}`);
          },

          onPending: () => {
            toast("Menunggu pembayaran", {
              description: "Transaksi berhasil dibuat. Selesaikan pembayaranmu.",
            });
            navigate(`/order-success?order_id=${order.id}`);
          },

          onError: (err: any) => {
            console.error("Midtrans error:", err);
            toast.error("Pembayaran gagal", {
              description: "Silakan coba metode pembayaran lain.",
            });
          },

          onClose: () => {
            toast("Pembayaran dibatalkan", {
              description: "Kamu menutup jendela pembayaran sebelum selesai.",
            });
          },
        });

    } catch (error) {
      console.error("Checkout error", error);
      toast.error("Gagal memproses pesanan", {
        description: "Periksa data dan coba beberapa saat lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ====== State auth loading / belum login ======
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
        <div className="border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto flex items-center gap-3 px-4 py-5">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Checkout</p>
              <h1 className="text-xl font-semibold">Memuat data akun...</h1>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-12">
          <Card className="mx-auto max-w-2xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Menyiapkan checkout</CardTitle>
              <CardDescription>
                Kami sedang memuat informasi akun dan keranjang.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
        <div className="border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto flex items-center gap-3 px-4 py-5">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Checkout</p>
              <h1 className="text-xl font-semibold">
                Masuk untuk menyelesaikan pesanan
              </h1>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-12">
          <Card className="mx-auto max-w-2xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Butuh akun untuk checkout</CardTitle>
              <CardDescription>
                Masuk atau daftar terlebih dahulu agar detail pengirimanmu
                tersimpan aman di Supabase.
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
                Kembali ke beranda
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ====== UI utama ======
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 text-foreground">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Checkout</p>
              <h1 className="text-xl font-semibold">
                Lengkapi detail pengiriman
              </h1>
              <p className="text-sm text-muted-foreground">
                Pastikan informasi sudah benar sebelum membayar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
              <ShieldCheck className="h-4 w-4" />
              Data aman dan terenkripsi
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1 sm:flex">
              <Truck className="h-4 w-4" />
              Pengiriman cepat
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Form kiri */}
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Informasi penerima</CardTitle>
                <CardDescription>
                  Kami akan menggunakan detail ini untuk memproses pengiriman.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Detail penerima tersimpan
                    </p>
                    <h3 className="text-lg font-semibold">Data dikirim sesuai profilmu</h3>
                  </div>
                </div>

                {profileLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                ) : missingProfileFields.length > 0 ? (
                  <div className="space-y-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/10 p-4">
                    <p className="font-semibold text-destructive">Lengkapi profilmu terlebih dahulu</p>
                    <p className="text-sm text-destructive/80">
                      Kami butuh data berikut agar alamat otomatis terisi: {missingProfileFields.join(", ")}.
                    </p>
                    <Button variant="destructive" asChild size="sm">
                      <Link to="/dashboard/profile">Lengkapi sekarang</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 rounded-lg border bg-card/60 p-3">
                      <p className="text-xs uppercase text-muted-foreground">Nama lengkap</p>
                      <p className="text-sm font-semibold">{profileFullName}</p>
                    </div>
                    <div className="space-y-1 rounded-lg border bg-card/60 p-3">
                      <p className="text-xs uppercase text-muted-foreground">Nomor telepon</p>
                      <p className="text-sm font-semibold">{profilePhone}</p>
                    </div>
                    <div className="space-y-1 rounded-lg border bg-card/60 p-3">
                      <p className="text-xs uppercase text-muted-foreground">Alamat lengkap</p>
                      <p className="text-sm font-semibold">{profileAddress}</p>
                    </div>
                    <div className="space-y-1 rounded-lg border bg-card/60 p-3">
                      <p className="text-xs uppercase text-muted-foreground">Kota &amp; Kode pos</p>
                      <p className="text-sm font-semibold">
                        {profileCity} & {profilePostalCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Pilihan pengiriman</Label>
                  <Select
                    value={shippingMethod}
                    onValueChange={(value) => setShippingMethod(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih pengiriman" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reguler">Reguler (2-4 hari)</SelectItem>
                      <SelectItem value="Ekspres">Ekspres (1-2 hari)</SelectItem>
                      <SelectItem value="Same Day">Same day (kota tertentu)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Biaya pengiriman disesuaikan alamat tujuan.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <MapPin className="h-4 w-4" />
                  Pastikan alamat sudah sesuai agar pengiriman tepat waktu.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Ringkasan kanan */}
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Ringkasan pesanan</CardTitle>
                <CardDescription>Periksa kembali item yang akan dikirim.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {cartLoading && !directPurchase ? (
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    </div>
                  ) : purchaseItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 px-4 py-6 text-center">
                      <p className="font-semibold">Keranjang kosong</p>
                      <p className="text-sm text-muted-foreground">
                        Tambahkan produk ke keranjang untuk melanjutkan ke checkout.
                      </p>
                      <Button className="mt-3" asChild>
                        <Link to="/">Mulai belanja</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {purchaseItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between rounded-lg border bg-card/60 p-3"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">
                              {item.product?.name ?? "Produk tanpa nama"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Jumlah {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(
                              (item.product?.price ?? 0) * item.quantity
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimasi ongkir</span>
                    <span className="text-muted-foreground">
                      Akan dihitung otomatis
                    </span>
                  </div>
                </div>

                <Button className="w-full" disabled={submitting || hasInsufficientStock} onClick={handleSubmit}>
                  {submitting ? "Memproses..." : "Bayar Sekarang"}
                </Button>
                {hasInsufficientStock && (
                  <p className="text-center text-sm font-medium text-destructive">
                    Checkout tidak dapat dilanjutkan karena ada stok yang habis atau kurang.
                  </p>
                )}

                <Separator />

                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total tagihan</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
