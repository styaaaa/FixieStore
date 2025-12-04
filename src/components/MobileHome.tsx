import type { Category, Product } from "@/types/catalog";
import { ProductCard } from "./ProductCard";

interface MobileHomeProps {
  featuredProducts: Product[];
  wishlistProducts: Product[];
  onAddToCart: (product: Product) => void;
  categories: Category[];
  activeCategory: string | null;
  onCategorySelect: (categoryId?: string) => void;
  onScrollToCategories: () => void;
}

export const MobileHome = ({
  featuredProducts,
  wishlistProducts,
  onAddToCart,
  categories,
  activeCategory,
  onCategorySelect,
  onScrollToCategories,
}: MobileHomeProps) => {
  return (
    <div className="md:hidden">
      {/* Quick filters */}
      <div className="sticky top-14 z-40 flex gap-2 overflow-x-auto border-b bg-background px-4 py-3 scrollbar-none">
        <button
          className={`px-3 py-2 rounded-full text-sm border ${!activeCategory ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          onClick={() => onCategorySelect()}
        >
          Semua
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-3 py-2 rounded-full text-sm border ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Best Seller</h3>
            <button className="text-sm text-primary" onClick={onScrollToCategories}>
              Lihat semua
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      )}

      {wishlistProducts.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">New Arrivals</h3>
            <button className="text-sm text-primary" onClick={onScrollToCategories}>
              Lihat semua
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {wishlistProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
