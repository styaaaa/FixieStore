import type { Category, Product } from "@/types/catalog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ProductCard } from "./ProductCard";

const mobileSlides = [
  {
    id: "poster",
    title: "Retro spirit, pedal with it",
    image: "/Poster.png",
  },
  {
    id: "part",
    title: "Timeless ride, fixie pride",
    image: "/part.png",
  },
  {
    id: "cycology",
    title: "Culture moves, fixie proves",
    image: "/cycology.png",
  },
];

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
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Welcome to FixieStore</h2>
          <p className="text-sm opacity-90">Discover amazing products</p>
        </div>

        <div className="mt-4">
          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
            aria-label="Promo slider mobile"
          >
            <CarouselContent className="-ml-3">
              {mobileSlides.map((slide) => (
                <CarouselItem key={slide.id} className="pl-3">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-md">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-48 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white drop-shadow-md">
                      <p className="text-sm font-medium leading-tight">{slide.title}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {/* Quick filters */}
      <div className="bg-background border-b px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
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
