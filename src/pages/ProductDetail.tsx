import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/cart-context";
import { getProductById } from "@/lib/repositories/catalogRepository";
import { getReviewsByProduct } from "@/lib/repositories/reviewRepository";
import type { Product } from "@/types/catalog";
import type { ProductReview } from "@/types/review";

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value ?? 0);

const ProductDetail = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { addToCart, cartLoading } = useCart();

  const { data: product, isLoading, error } = useQuery<Product | null>({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId!),
    enabled: Boolean(productId),
  });

  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    setReviews(getReviewsByProduct(productId));
  }, [productId]);

  useEffect(() => {
    if (error) {
      toast.error("Gagal memuat produk");
      console.error(error);
    }
  }, [error]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, item) => sum + item.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const handleAddToCart = async (currentProduct: Product) => {
    try {
      await addToCart(currentProduct.id);
      toast.success(`${currentProduct.name} ditambahkan ke keranjang`);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menambahkan ke keranjang");
    }
  };

  const handleCheckout = (currentProduct: Product) => {
    navigate("/checkout", {
      state: {
        directPurchase: { product: currentProduct, quantity: 1 },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-10 w-32" />
          <Card>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">Produk tidak ditemukan</p>
          <h1 className="text-2xl font-semibold">Ups, produk yang dicari belum tersedia</h1>
          <Button onClick={() => navigate(-1)}>Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 text-foreground">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Detail produk</p>
            <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
          </div>
        </div>

        <Card className="overflow-hidden shadow-sm">
          <CardContent className="grid gap-8 p-6 md:grid-cols-[1.2fr_1fr]">
            <div className="overflow-hidden rounded-2xl border bg-background">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[360px] items-center justify-center bg-muted text-muted-foreground">
                  Foto produk belum tersedia
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                {product.brand && <Badge variant="outline">{product.brand}</Badge>}
                <h2 className="text-2xl font-semibold leading-tight">{product.name}</h2>
                <p className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>
                <p className="text-sm text-muted-foreground">Stok tersisa: {product.stock}</p>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-base text-foreground">{product.description}</p>
                <p>{product.longDescription || "Belum ada deskripsi panjang."}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Pengiriman</p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4" />
                    <span>Reguler & Same Day tersedia</span>
                  </div>
                </div>
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Skor ulasan</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                    <span className="text-lg font-semibold">{averageRating || "Belum ada"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{reviews.length} ulasan</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => handleAddToCart(product)} disabled={cartLoading}>
                  Tambah ke keranjang
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleCheckout(product)}
                  disabled={cartLoading}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Ulasan Pembeli</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ditampilkan hanya dari pesanan yang statusnya sukses.
                </p>
              </div>
              <Badge variant="secondary">{reviews.length} ulasan</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada ulasan. Selesaikan pembayaran dan tulis review di halaman pesanan untuk tampil di sini.
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="space-y-2 rounded-lg border bg-background p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${index < review.rating ? "fill-amber-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{review.message}</p>
                  <Separator />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Order ID: {review.orderId}</span>
                    {review.userName && <span>Oleh {review.userName}</span>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
