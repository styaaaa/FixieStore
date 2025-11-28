import { Button } from "@/components/ui/button";
import type { Category } from "@/types/catalog";

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
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onCategorySelect,
  onScrollToCategories
}: MobileQuickActionsProps) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-2 z-40">
      <Button 
        variant="outline" 
        className="flex-1"
        onClick={onScrollToCategories}
      >
        Categories
      </Button>
      <Button variant="default" className="flex-1">
        Cart ({cartCount})
      </Button>
    </div>
  );
};
