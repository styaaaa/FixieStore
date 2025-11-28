import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Product } from "@/types/catalog";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        {product.brand && (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        )}
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-lg font-bold text-primary">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => onAddToCart(product)}>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
