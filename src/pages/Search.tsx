import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FixieLoading } from "@/components/FixieLoading";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCategories, getProducts } from "@/lib/repositories/catalogRepository";
import type { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";

const SearchPage = () => {
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const initialCategories = useMemo(
    () => searchParams.get("categories")?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [shuffleKey, setShuffleKey] = useState(0);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["search-categories"],
    queryFn: getCategories,
  });

  const {
    data: products = [],
    isLoading: loadingProducts,
    error: productsError,
  } = useQuery<Product[]>({
    queryKey: ["search-products"],
    queryFn: () => getProducts(),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategories, setSearchParams]);

  useEffect(() => {
    if (productsError) {
      toast.error("Gagal memuat produk");
      console.error(productsError);
    }
  }, [productsError]);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((previous) => {
      if (previous.includes(categoryId)) {
        return previous.filter((id) => id !== categoryId);
      }

      return [...previous, categoryId];
    });
  }, []);

  const handleHeaderCategory = useCallback((categoryId?: string) => {
    if (!categoryId) {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories([categoryId]);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSearchQuery("");
    navigate("/search", { replace: true });
  }, [navigate]);

  const handleSearchSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      navigate(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : "/search");
    },
    [navigate, searchQuery],
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      try {
        await addToCart(product.id);
        toast.success(`${product.name} ditambahkan ke keranjang`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Gagal menambahkan ke keranjang";
        toast.error(message);
      }
    },
    [addToCart],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchesQuery = (product: Product) =>
      [product.name, product.brand].some((value) => value.toLowerCase().includes(normalizedQuery));

    const matchesCategory = (product: Product) =>
      selectedCategories.length === 0 || (product.categoryId && selectedCategories.includes(product.categoryId));

    const base = products.filter((product) => matchesCategory(product) && matchesQuery(product));

    if (!shuffleKey) return base;

    return [...base].sort(() => 0.5 - Math.random());
  }, [products, searchQuery, selectedCategories, shuffleKey]);

  const randomSpotlight = useMemo(() => {
    if (products.length === 0) return null;
    const pool = filteredProducts.length > 0 ? filteredProducts : products;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [filteredProducts, products]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_15%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.04),transparent_22%),hsl(var(--background))] text-foreground">
      <Header
        cartItemCount={cartCount}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        categories={categories}
        activeCategory={selectedCategories[0] ?? null}
        onCategorySelect={handleHeaderCategory}
        transparent={false}
        hideSearchControls
      />

      <main className="container mx-auto px-4 pb-16">
        <div className="py-10 md:py-12">
          <div className="rounded-3xl border bg-card/80 shadow-xl">
            <div className="grid gap-6 p-6 md:grid-cols-[300px,1fr] md:p-10">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Search system</p>
                  <h1 className="text-3xl font-bold">Temukan produk favoritmu</h1>
                  <p className="text-sm text-muted-foreground">Ketik untuk melihat saran instan, pilih kategori, atau acak rekomendasi.</p>
                </div>

                <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Filter Kategori</p>
                      <p className="text-xs text-muted-foreground">Pilih lebih dari satu kategori sekaligus</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShuffleKey(Date.now())}>
                      Acak produk
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                    {loadingCategories ? (
                      <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                        ))}
                      </div>
                    ) : (
                      categories.map((category) => (
                        <label key={category.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-muted">
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => handleToggleCategory(category.id)}
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </label>
                      ))
                    )}
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedCategories.map((categoryId) => {
                        const categoryName = categories.find((cat) => cat.id === categoryId)?.name ?? "Kategori";
                        return (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="flex items-center gap-2"
                            onClick={() => handleToggleCategory(categoryId)}
                          >
                            {categoryName}
                            <span className="text-xs text-muted-foreground">(hapus)</span>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <Button variant="ghost" size="sm" className="mt-4" onClick={handleClearFilters}>
                    Bersihkan filter
                  </Button>
                </div>

                {randomSpotlight && (
                  <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Pilihan acak</p>
                    <p className="text-lg font-semibold leading-tight">{randomSpotlight.name}</p>
                    <p className="text-sm text-muted-foreground">{randomSpotlight.brand || "Produk"}</p>
                    <p className="mt-2 text-base font-semibold text-primary">
                      Rp {randomSpotlight.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <form onSubmit={handleSearchSubmit} className="space-y-2">
                  <Label htmlFor="search-query" className="text-sm font-semibold text-muted-foreground">
                    Masukkan kata kunci
                  </Label>
                  <Input
                    id="search-query"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Cari sepatu, apparel, atau aksesoris"
                  />
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full border px-2 py-1">Enter untuk membuka halaman pencarian</span>
                    <span className="rounded-full border px-2 py-1">Saran muncul otomatis saat mengetik</span>
                    <span className="rounded-full border px-2 py-1">Pilih lebih dari satu kategori</span>
                  </div>
                </form>

                <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{filteredProducts.length} produk ditemukan</p>
                    {selectedCategories.length > 0 ? (
                      <p className="text-muted-foreground">Difilter berdasarkan kategori pilihanmu</p>
                    ) : (
                      <p className="text-muted-foreground">Menampilkan semua kategori</p>
                    )}
                  </div>
                  <Button variant="default" onClick={handleSearchSubmit}>
                    Mulai mencari
                  </Button>
                </div>

                {loadingProducts ? (
                  <FixieLoading message="Memuat produk" size="md" fullscreen={false} />
                ) : filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border bg-background p-8 text-center shadow-sm">
                    <p className="text-lg font-semibold">Produk tidak ditemukan</p>
                    <p className="text-sm text-muted-foreground">
                      Coba kata kunci lain atau pilih kategori berbeda.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
