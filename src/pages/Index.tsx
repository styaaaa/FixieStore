import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { FixieLoading } from "@/components/FixieLoading";
import { useCart } from "../context/cart-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MobileQuickActions } from "@/components/MobileQuickActions";
import { MobileHome } from "@/components/MobileHome";
import { getCategories, getProducts } from "@/lib/repositories/catalogRepository";
import type { Category, Product } from "@/types/catalog";
import { BrandPartners } from "@/components/BrandPartners";

const Index = () => {
  const { addToCart, cartCount } = useCart();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);

  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: categoriesError,
  } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: getCategories });

  const {
    data: products = [],
    isLoading: loadingProducts,
    error: productsError,
  } = useQuery<Product[]>({
    queryKey: ["products", activeCategory],
    queryFn: () => getProducts(activeCategory),
  });

  useEffect(() => {
    if (categoriesError) {
      toast.error("Gagal memuat kategori");
      console.error(categoriesError);
    }
  }, [categoriesError]);

  useEffect(() => {
    if (productsError) {
      toast.error("Gagal memuat produk");
      console.error(productsError);
    }
  }, [productsError]);

  useEffect(() => {
    const element = heroSectionRef.current;
    if (!element) {
      setIsHeroVisible(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleCategoryChange = useCallback((categoryId?: string) => {
    setActiveCategory((current) => {
      if (current === categoryId) return null;
      return categoryId ?? null;
    });
  }, []);

  const scrollToCategories = useCallback(() => {
    if (categorySectionRef.current) {
      categorySectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return products;

    return products.filter((product) =>
      [product.name, product.brand].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [products, searchQuery]);

  const bestSellerProducts = useMemo(
    () => filteredProducts.slice(0, 4),
    [filteredProducts]
  );

  const newArrivalProducts = useMemo(
    () => (filteredProducts.length > 4 ? filteredProducts.slice(4) : []),
    [filteredProducts]
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      try {
        await addToCart(product.id);
        toast.success(`${product.name} ditambahkan ke keranjang`);
      } catch (error: any) {
        toast.error(error?.message || "Gagal menambahkan ke keranjang");
      }
    },
    [addToCart]
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 md:pb-0">
      <Header
        cartItemCount={cartCount}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={handleCategoryChange}
        onNavigateToSearch={scrollToCategories}
        transparent={isHeroVisible}
      />

      <div ref={heroSectionRef} className="hidden md:block">
        <HeroSection />
        
      </div>

      <MobileHome
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        featuredProducts={bestSellerProducts}
        wishlistProducts={
          newArrivalProducts.length > 0 ? newArrivalProducts : bestSellerProducts
        }
        onAddToCart={handleAddToCart}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={handleCategoryChange}
        onScrollToCategories={scrollToCategories}
      />

      {/* KATEGORI */}
      <div
        id="kategori"
        className="border-t border-b bg-card/30 scroll-mt-28"
        ref={categorySectionRef}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible">
            <Button
              variant={!activeCategory ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange()}
            >
              Semua
            </Button>

            {loadingCategories ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-9 w-24 flex-none rounded-full bg-muted/60"
                />
              ))
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada kategori</p>
            ) : (
              categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </Button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PRODUK */}
      <section className="container mx-auto px-4 py-8">
        {loadingProducts ? (
          <FixieLoading
            message="Memuat produk..."
            size="md"
            fullscreen={false}
          />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold">Tidak ada produk ditemukan</h3>
            <p className="text-muted-foreground">
              Coba ubah kategori atau kata pencarian
            </p>
          </div>
        ) : (
          <>
            {/* Best Seller */}
            <div className="mb-12">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Best Seller
              </p>
              <h2 className="text-3xl font-bold mb-6">Pilihan Produk Terlaris</h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {bestSellerProducts.map((product) => (
                  <ProductCard
                    key={`best-${product.id}`}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>

            {/* New Arrivals */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                New Arrivals
              </p>
              <h2 className="text-3xl font-bold mb-6">Koleksi Terbaru</h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {newArrivalProducts.map((product) => (
                  <ProductCard
                    key={`new-${product.id}`}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <BrandPartners />
      
      <Footer />

      <MobileQuickActions
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={handleCategoryChange}
        onScrollToCategories={scrollToCategories}
      />
    </div>
  );
};

export default Index;
