// src/pages/Checkout.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
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
import { decreaseProductStock } from "@/lib/repositories/catalogRepository";
import { createOrder } from "@/lib/repositories/orderRepository";
import { createMidtransTransaction } from "@/lib/repositories/paymentRepository";
import { supabase } from "@/lib/supabaseClient";
import { savePurchasedProducts } from "@/lib/repositories/reviewRepository";

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
  const { user, authLoading } = useAuth();
  const { cartItems, cartLoading, refreshCart, clearCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank");
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
      cartItems.reduce(
        (total, item) => total + (item.product?.price ?? 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const highlightCards = [
    {
      title: "Pembayaran terenkripsi",
      description: "Setiap transaksi dijaga oleh standar keamanan modern.",
      Icon: ShieldCheck,
    },
    {
      title: "Dukungan 24/7",
      description: "Mulai dari pembayaran hingga pengiriman, kami siap bantu.",
      Icon: Package,
    },
    {
      title: "Pengiriman terintegrasi",
      description: "Lacak paket langsung dari dashboard setelah pesanan dibuat.",
      Icon: Truck,
    },
  ];

  // ====== Validasi stok sebelum buat order ======
  const validateStock = () => {
    const unavailableItem = cartItems.find((item) => {
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

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error("Silakan masuk untuk melanjutkan checkout");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Keranjangmu masih kosong");
      return;
    }

    if (!validateStock()) return;

    setSubmitting(true);

    try {
      // 1. Buat order pending
      const order = await createOrder({
        userId: user.id,
        paymentMethod,
        shippingMethod,
        totalPrice,
        firstName,
        lastName,
        phone,
        address,
        city,
        postalCode,
      });

      // 2. Minta token Midtrans ke Edge Function
        createMidtransTransaction({
        orderId: order.id,
        grossAmount: totalPrice,
        customerDetails: {
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
        email: user.email // WAJIB
  },
});


      if (!window.snap) {
        toast.error("Layanan pembayaran belum siap. Coba beberapa saat lagi.");
        return;
      }

      const midtransData = await createMidtransTransaction({
    orderId: order.id,
    grossAmount: totalPrice,
    customerDetails: {
    first_name: firstName,
    last_name: lastName,
    phone,
    address,
    email: user.email
  },
});

// 3. Jalankan Midtrans Snap popup
window.snap.pay(midtransData.token, {
  onSuccess: async () => {
    try {
      // update status ke success (fallback jika webhook sudah handle)
      await supabase
        .from("orders")
        .update({ status: "success" })
        .eq("id", order.id);

      // simpan produk yang berhasil dibeli untuk referensi ulasan
      savePurchasedProducts(order.id, cartItems);

      // kurangi stok dan bersihkan cart
      await Promise.all(
        cartItems.map((item) =>
          decreaseProductStock(item.productId, item.quantity)
        )
      );
      await clearCart();

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

  onError: (err) => {
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
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nama depan</Label>
                      <Input
                        id="firstName"
                        placeholder="Nama depan"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nama belakang</Label>
                      <Input
                        id="lastName"
                        placeholder="Nama belakang"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Kota / Kabupaten</Label>
                      <Input
                        id="city"
                        placeholder="Jakarta, Bandung, ..."
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Alamat lengkap</Label>
                      <Input
                        id="address"
                        placeholder="Nama jalan, nomor rumah, patokan"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Kode pos</Label>
                      <Input
                        id="postalCode"
                        placeholder="XXXXX"
                        value={postalCode}
                        onChange={(event) =>
                          setPostalCode(event.target.value)
                        }
                        required
                      />
                    </div>
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
                          <SelectItem value="Reguler">
                            Reguler (2-4 hari)
                          </SelectItem>
                          <SelectItem value="Ekspres">
                            Ekspres (1-2 hari)
                          </SelectItem>
                          <SelectItem value="Same Day">
                            Same day (kota tertentu)
                          </SelectItem>
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
                </form>
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
                  {cartLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    </div>
                  ) : cartItems.length === 0 ? (
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
                      {cartItems.map((item) => (
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
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Biaya layanan</span>
                    <span>Termasuk</span>
                  </div>
                </div>

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
