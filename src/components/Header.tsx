import { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Moon,
  Search as SearchIcon,
  ShoppingBag,
  ShoppingCart,
  Sun,
} from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

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
  const { user, isAdmin, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  const handleProfileClick = useCallback(() => {
    if (isAdmin) {
      navigate("/admin/dashboard");
      return;
    }

    navigate("/dashboard");
  }, [isAdmin, navigate]);

  const handleCartClick = useCallback(() => {
    navigate("/cart");
  }, [navigate]);

  const avatarFallback = useMemo(() => {
    const initial = user?.email?.charAt(0)?.toUpperCase();
    return initial || "U";
  }, [user]);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-lg transition-colors ${transparent ? "bg-background/40" : "bg-background/95"}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Kembali ke beranda"
              onClick={handleHomeClick}
            >
              <Home className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2" aria-label="FixieStore">
              <img
                src="/fixie-icon.svg"
                alt="Ikon FixieStore"
                className="h-9 w-9 rounded-full border bg-muted/60 p-1 fixie-icon"
              />
              <h1 className="text-2xl font-bold">FixieStore</h1>
            </Link>
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
              aria-label="Ubah tema"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Pergi ke pencarian"
              onClick={handleStoreClick}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buka keranjang"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {cartItemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
                  {cartItemCount}
                </span>
              )}
            </div>
            {authLoading ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" aria-label="Memuat status akun" />
            ) : user ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border"
                aria-label="Buka dashboard"
                onClick={handleProfileClick}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={(user.user_metadata as Record<string, string> | undefined)?.avatar_url}
                    alt="Foto profil"
                  />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild size="sm">
                  <Link to="/login">Masuk</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
