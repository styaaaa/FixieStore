import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { PromoBanner } from "@/components/PromoBanner";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { FixieLoading } from "@/components/FixieLoading";
import BrandPartners from "@/components/BrandPartners";
import { useCart } from "../context/cart-context";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MobileQuickActions } from "@/components/MobileQuickActions";
import { MobileHome } from "@/components/MobileHome";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Index = () => {
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);

  // =========================
  // FETCH CATEGORIES
  // =========================
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } else {
        const cleaned = (data || []).filter((c) => {
          const n = c.name?.trim().toLowerCase();
          const s = c.slug?.trim().toLowerCase();
          return n !== "semua" && s !== "semua";
        });
        setCategories(cleaned);
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async (categoryId?: string) => {
    setLoadingProducts(true);
    try {
      let q = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (categoryId) q = q.eq("category_id", categoryId);

      const { data, error } = await q;

      if (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================
  // RUN FETCH ON LOAD
  // =========================
  useEffect(() => {
    console.log("USE EFFECT RUN → FETCH DATA");
    fetchCategories();
    fetchProducts();
  }, []);

  // =========================
  // HERO VISIBILITY
  // =========================
  useEffect(() => {
    const el = heroSectionRef.current;
    if (!el) return setIsHeroVisible(false);

    const obs = new IntersectionObserver(
      ([e]) => setIsHeroVisible(e.isIntersecting),
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // =========================
  // AUTH EVENTS
  // =========================
  useEffect(() => {
    const { data: subscriptionObj } = supabase.auth.onAuthStateChange(
      (evt, session) => {
        console.log("Auth event:", evt, session ? "IN" : "OUT");
      }
    );

    return () => subscriptionObj.subscription.unsubscribe();
  }, []);

  const handleCategoryChange = async (categoryId?: string) => {
    if (categoryId === activeCategory) {
      setActiveCategory(null);
      fetchProducts();
    } else {
      setActiveCategory(categoryId || null);
      fetchProducts(categoryId);
    }
  };

  const scrollToCategories = () => {
    if (categorySectionRef.current) {
      categorySectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // =========================
  // FILTER PRODUCTS (SAFE)
  // =========================
  const filteredProducts = useMemo(() => {
    const arr = Array.isArray(products) ? products : [];
    const s = searchQuery.toLowerCase();

    return arr.filter(
      (p) =>
        p.name?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase()?.includes(s)
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

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product.id);
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan ke keranjang");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 md:pb-0">
      <Header
        cartItemCount={cartCount}
        onSearchChange={setSearchQuery}
        transparent={isHeroVisible}
      />

      <div ref={heroSectionRef} className="hidden md:block">
        <HeroSection />
        <PromoBanner />
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
                {bestSellerProducts.map((p) => (
                  <ProductCard
                    key={`best-${p.id}`}
                    product={p}
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
                {newArrivalProducts.map((p) => (
                  <ProductCard
                    key={`new-${p.id}`}
                    product={p}
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
