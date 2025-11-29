import type React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Product } from "@/types/catalog";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  compact?: boolean;
}

export const ProductCard = ({ product, onAddToCart, compact }: ProductCardProps) => {
  const navigate = useNavigate();

  const handleNavigate = () => navigate(`/products/${product.id}`);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden border border-primary/10 bg-gradient-to-br from-card/95 via-card to-primary/8 shadow-[0_14px_38px_-28px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_18px_42px_-22px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:to-primary/12 ${compact ? "md:hover:-translate-y-1" : ""}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-stone-200/24 dark:from-primary/15 dark:via-transparent dark:to-primary/20" />
      </div>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-200/70 via-primary/60 to-stone-300/70" />

      <div
        className={`relative overflow-hidden rounded-b-2xl bg-muted/60 ${
          compact ? "aspect-[4/5]" : "aspect-square"
        }`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-muted-foreground">No Image</span>
          </div>
        )}
      </div>

      <CardContent className={`relative flex flex-1 flex-col p-4 ${compact ? "space-y-2" : "space-y-3"}`}>
        {product.brand && (
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {product.brand}
          </p>
        )}
        <h3 className="text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="text-xl font-bold text-primary">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
      </CardContent>
      <CardFooter className="relative mt-auto p-4 pt-0">
        <div className="w-full">
          <Button
            className="w-full bg-primary/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            onClick={(event) => {
              event.stopPropagation();
              onAddToCart(product);
            }}
          >
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
