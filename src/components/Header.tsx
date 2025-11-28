import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search as SearchIcon, ShoppingBag, ShoppingCart } from "lucide-react";

import type { Category } from "@/types/catalog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface HeaderProps {
  cartItemCount: number;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  categories: Category[];
  activeCategory: string | null;
  onCategorySelect: (categoryId?: string) => void;
  onNavigateToSearch?: () => void;
  transparent?: boolean;
}

export const Header = ({
  cartItemCount,
  onSearchChange,
  searchQuery,
  categories,
  activeCategory,
  onCategorySelect,
  onNavigateToSearch,
  transparent,
}: HeaderProps) => {
  const navigate = useNavigate();

  const categoryValue = useMemo(
    () => activeCategory ?? "all",
    [activeCategory],
  );

  const handleHomeClick = useCallback(() => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const handleStoreClick = useCallback(() => {
    if (onNavigateToSearch) {
      onNavigateToSearch();
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [onNavigateToSearch]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      if (value === "all") {
        onCategorySelect();
        return;
      }

      onCategorySelect(value);
    },
    [onCategorySelect],
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-lg transition-colors ${transparent ? "bg-background/40" : "bg-background/95"}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Kembali ke beranda"
              onClick={handleHomeClick}
            >
              <Home className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">FixieStore</h1>
          </div>

          <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:items-center md:justify-center">
            <div className="flex items-center gap-2 w-full md:w-2/5 lg:w-[40%]">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Cari produk atau brand"
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={categoryValue} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Pergi ke pencarian"
              onClick={handleStoreClick}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" aria-label="Buka keranjang">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {cartItemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
                  {cartItemCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
