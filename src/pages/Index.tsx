import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { useCart } from "../context/cart-context";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MobileHome } from "@/components/MobileHome";
import { Spinner } from "@/components/ui/spinner";
import { getCategories, getProducts } from "@/lib/repositories/catalogRepository";
import type { Category, Product } from "@/types/catalog";
import { BrandPartners } from "@/components/BrandPartners";

const FullscreenSpinner = ({ message }: { message: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-8 text-center shadow-lg">
      <Spinner className="h-10 w-10 text-primary" />
      <p className="text-base font-semibold text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">Harap tunggu sebentar</p>
    </div>
  </div>
);

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

  const displayedProducts = useMemo(
    () => products.slice(0, 8),
    [products]
  );

const bestSellerProducts = useMemo(
    () => displayedProducts.slice(0, 4),
    [displayedProducts]
  );

  const newArrivalProducts = useMemo(
    () => displayedProducts.slice(4, 8),
    [displayedProducts]
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
      } catch (error: any) {
        toast.error(error?.message || "Gagal menambahkan ke keranjang");
      }
    },
    [addToCart]
  );

  return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_10%_15%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.04),transparent_22%),hsl(var(--background))] text-foreground pb-16 md:pb-0">
        <Header
          cartItemCount={cartCount}
          onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={handleCategoryChange}
        onNavigateToSearch={scrollToCategories}
        transparent={isHeroVisible}
          overlay
        />

        <div ref={heroSectionRef}>
          <HeroSection />
        </div>

        <div className="pt-20 md:pt-28">
          <MobileHome
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
        {/* <div id="kategori" className="scroll-mt-28 bg-background/60" ref={categorySectionRef}>
          <div className="container mx-auto px-4 py-3">
            <div className="rounded-full border border-white/5 bg-gradient-to-r from-background/90 via-background/60 to-background/90 p-2 shadow-lg shadow-primary/5">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-none rounded-full border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/15 ${
                    !activeCategory
                      ? "border-primary/60 bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => handleCategoryChange()}
                >
                  Semua
                </Button>

             {loadingCategories ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-10 w-28 flex-none rounded-full bg-muted/60"
                    />
                  ))
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada kategori</p>
                ) : (
                  categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant="outline"
                      size="sm"
                      className={`flex-none rounded-full border-primary/20 bg-background/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-foreground ${
                        activeCategory === cat.id
                          ? "border-primary/60 bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : ""
                      }`}
                      onClick={() => handleCategoryChange(cat.id)}
                    >
                      {cat.name}
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>
       </div> */}

      {/* PRODUK */}
        <section className="container mx-auto px-4 py-8">
          {loadingProducts ? (
            <FullscreenSpinner message="Memuat produk..." />
          ) : products.length === 0 ? (
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
                  New Arrival
                </p>
                <h2 className="text-3xl font-semibold mb-6">Pilihan Produk Terbaru</h2>


              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

               <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
      </div>

      <BrandPartners />
      
      <Footer />

    </div>
  );
};

export default Index;
