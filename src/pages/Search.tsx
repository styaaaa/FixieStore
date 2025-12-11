import type { FormEvent, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories, getProducts } from "@/lib/repositories/catalogRepository";
import type { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";
import { Filter, Menu, Search as SearchIcon, Sparkles, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const ITEMS_PER_ROW = 4;
const ROWS_PER_BATCH = 4;
const ITEMS_PER_BATCH = ITEMS_PER_ROW * ROWS_PER_BATCH;

const FullscreenSpinner = ({ message }: { message: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-8 text-center shadow-lg">
      <Spinner className="h-10 w-10 text-primary" />
      <p className="text-base font-semibold text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">Harap tunggu sebentar</p>
    </div>
  </div>
);

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
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [sortOption, setSortOption] = useState<"recommended" | "price-asc" | "price-desc">(
    "recommended",
  );

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

  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
  }, [searchQuery, selectedCategories, minPrice, maxPrice, sortOption]);

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
    (event?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) => {
      event?.preventDefault();
      navigate(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : "/search");
    },
    [navigate, searchQuery],
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (product.stock <= 0) {
        toast.error("Stok produk habis");
        return;
      }

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

    const min = Number(minPrice);
    const max = Number(maxPrice);

    const matchesPrice = (product: Product) => {
      const aboveMin = !minPrice || (!Number.isNaN(min) && product.price >= min);
      const belowMax = !maxPrice || (!Number.isNaN(max) && product.price <= max);
      return aboveMin && belowMax;
    };

    const base = products.filter(
      (product) => matchesCategory(product) && matchesQuery(product) && matchesPrice(product),
    );

    const sorted = (() => {
      if (sortOption === "price-asc") {
        return [...base].sort((first, second) => first.price - second.price);
      }

      if (sortOption === "price-desc") {
        return [...base].sort((first, second) => second.price - first.price);
      }

      if (shuffleKey) {
        return [...base].sort(() => 0.5 - Math.random());
      }

      return base;
    })();

    return sorted;
  }, [products, searchQuery, selectedCategories, shuffleKey, minPrice, maxPrice, sortOption]);

  const randomSpotlight = useMemo(() => {
    if (products.length === 0) return null;
    const pool = filteredProducts.length > 0 ? filteredProducts : products;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [filteredProducts, products]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((count) => count + ITEMS_PER_BATCH);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <div
              className={`grid gap-6 p-6 md:p-10 ${filtersVisible ? "md:grid-cols-[320px,1fr]" : "md:grid-cols-1"}`}
            >
              {filtersVisible && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Temukan produk favoritmu</h1>  
                  </div>

                  <div id="category-filter" className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">Filter kategori</p>
                        <p className="text-xs text-muted-foreground">Gabungkan beberapa kategori untuk hasil lebih presisi.</p>
                      </div>
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
                            <span className="text-xs text-muted-foreground">×</span>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div id="price-filter" className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Filter harga</p>
                      <p className="text-xs text-muted-foreground">Tentukan rentang harga yang diinginkan.</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                      Harga minimum
                    </Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                      Harga maksimum
                    </Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="Tidak dibatasi"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      min={0}
                    />
                  </div>
                </div>

                {(minPrice || maxPrice) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {minPrice && <Badge variant="secondary">Min: Rp {Number(minPrice).toLocaleString("id-ID")}</Badge>}
                    {maxPrice && <Badge variant="secondary">Max: Rp {Number(maxPrice).toLocaleString("id-ID")}</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => { setMinPrice(""); setMaxPrice(""); }}>
                      Hapus batas harga
                    </Button>
                  </div>
                )}
              </div>
            </div>
            )}

              <div className="space-y-4">
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <Label htmlFor="search-query" className="text-sm font-semibold text-muted-foreground">
                    Cari produk
                  </Label>
                  <div className="h-12 rounded-xl sm:w-auto flex items-center gap-3">
                    <div className="relative flex-1">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="search-query"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Cari disni..."
                        className="h-12 rounded-xl pl-10 pr-32"
                      />
                      <Button
                        type="submit"
                        className="absolute right-2 top-1/2 h-9 -translate-y-1/2 px-4"
                      >
                        Cari
                      </Button>
                    </div>
                   <div className="h-12 rounded-xl sm:w-auto flex items-center gap-3">
    {/* Tombol Tampilkan/Sembunyikan Filter */}
  <Button
    variant="outline"
    className="h-12 rounded-xl sm:w-auto border border-gray-300 dark:border-blackbg-white dark:bg-black text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
    type="button"
    onClick={() => setFiltersVisible((previous) => !previous)}
  >
    {filtersVisible ? (
      <>
        <X className="mr-2 h-4 w-4" />
        Sembunyikan filter
      </>
    ) : (
      <>
        <Filter className="mr-2 h-4 w-4" />
        Tampilkan filter
      </>
    )}
  </Button>

  {/* Dropdown Rekomendasi */}
  <Label htmlFor="sort-products" className="sr-only"></Label>
  <Select
    value={sortOption}
    onValueChange={(value: "recommended" | "price-asc" | "price-desc") => setSortOption(value)}
  >
    <SelectTrigger id="sort-products" className="w-48 h-12 rounded-xl border border-gray-300 dark:border-black bg-white dark:bg-black text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
      <SelectValue placeholder="Sort By" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="recommended">Rekomendasi</SelectItem>
      <SelectItem value="price-asc">Harga: terendah</SelectItem>
      <SelectItem value="price-desc">Harga: tertinggi</SelectItem>
    </SelectContent>
  </Select>
</div>

                  </div>
                </form>


                {loadingProducts ? (
                  <FullscreenSpinner message="Memuat produk" />
                ) : filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border bg-background p-8 text-center shadow-sm">
                    <p className="text-lg font-semibold">Produk tidak ditemukan</p>
                    <p className="text-sm text-muted-foreground">
                      Coba kata kunci lain atau pilih kategori berbeda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {visibleProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                          compact
                        />
                      ))}
                    </div>

                    {visibleCount < filteredProducts.length && (
                      <div className="flex justify-center">
                        <Button onClick={handleLoadMore} variant="outline" className="px-6">
                          Muat lebih banyak
                        </Button>
                      </div>
                    )}
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
