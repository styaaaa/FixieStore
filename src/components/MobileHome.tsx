import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';

interface MobileHomeProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  featuredProducts: any[];
  wishlistProducts: any[];
  onAddToCart: (product: any) => void;
  categories: any[];
  activeCategory: string | null;
  onCategorySelect: (categoryId?: string) => void;
  onScrollToCategories: () => void;
}

export const MobileHome = ({
  searchQuery,
  onSearchChange,
  featuredProducts,
  wishlistProducts,
  onAddToCart,
  categories,
  activeCategory,
  onCategorySelect,
  onScrollToCategories
}: MobileHomeProps) => {
  return (
    <div className="md:hidden">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to FixieStore</h2>
        <p className="text-sm opacity-90">Discover amazing products</p>
      </div>

      {/* Promo Banner */}
      <div className="bg-accent text-accent-foreground py-2 px-4 text-center text-sm">
        🎉 Special Promo: Get 20% off!
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="p-4">
          <h3 className="font-bold mb-4">Featured Products</h3>
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
