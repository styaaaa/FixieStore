import { Button } from "@/components/ui/button";
import type { Category } from "@/types/catalog";
import { useNavigate } from "react-router-dom";

interface MobileQuickActionsProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  activeCategory: string | null;
  onCategorySelect: (categoryId?: string) => void;
  onScrollToCategories: () => void;
}

export const MobileQuickActions = ({
  cartCount,
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  categories: _categories,
  activeCategory: _activeCategory,
  onCategorySelect: _onCategorySelect,
  onScrollToCategories
}: MobileQuickActionsProps) => {
  const navigate = useNavigate();

  const handleOpenCart = () => navigate("/cart");

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-2 z-40">
      <Button
        variant="outline"
        className="flex-1"
        onClick={onScrollToCategories}
      >
        Categories
      </Button>
      <Button variant="default" className="flex-1" onClick={handleOpenCart}>
        Cart ({cartCount})
      </Button>
    </div>
  );
};
