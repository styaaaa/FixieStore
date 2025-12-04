import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  LogIn,
  Moon,
  Search as SearchIcon,
  ShoppingBag,
  ShoppingCart,
  Sun,
  UserPlus,
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
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/repositories/catalogRepository";
import type { Product } from "@/types/catalog";

interface HeaderProps {
  cartItemCount: number;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  categories: Category[];
  activeCategory: string | null;
  onCategorySelect: (categoryId?: string) => void;
  onNavigateToSearch?: () => void;
  transparent?: boolean;
  hideSearchControls?: boolean;
  overlay?: boolean;
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
  hideSearchControls,
  overlay,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categoryValue = useMemo(
    () => activeCategory ?? "all",
    [activeCategory],
  );

  const handleHomeClick = useCallback(() => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const handleStoreClick = useCallback(() => {
    navigate("/search");
    onNavigateToSearch?.();
  }, [navigate, onNavigateToSearch]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      if (value === "all") {
        onCategorySelect();
        navigate("/search");
        return;
      }

      onCategorySelect(value);
      navigate(`/search?categories=${value}`);
    },
    [navigate, onCategorySelect],
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

  const handleSearchSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    },
    [navigate],
  );

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSearchSubmit(searchQuery);
      }
    },
    [handleSearchSubmit, searchQuery],
  );

  const { data: suggestionProducts = [] } = useQuery<Product[]>({
    queryKey: ["header-products", showSuggestions],
    queryFn: () => getProducts(),
    enabled: showSuggestions,
  });

  const filteredSuggestions = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return [] as Product[];

    return suggestionProducts
      .filter((product) =>
        [product.name, product.brand].some((value) =>
          value.toLowerCase().includes(normalized),
        ),
      )
      .slice(0, 8);
  }, [searchQuery, suggestionProducts]);

  useEffect(() => {
    setShowSuggestions(searchQuery.trim().length > 0);
  }, [searchQuery]);

  const formatCurrency = useCallback((price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const avatarFallback = useMemo(() => {
    const initial = user?.email?.charAt(0)?.toUpperCase();
    return initial || "U";
  }, [user]);

  const headerClasses = transparent
    ? theme === "dark"
      ? "bg-transparent text-white"
      : "bg-transparent text-foreground"
    : "border-b bg-background/95 backdrop-blur-lg";

  const headerPositionClasses = overlay
    ? "fixed left-0 top-0 w-full"
    : "sticky top-0";
  return (
    <header
      className={`z-50 transition-colors ${headerPositionClasses} ${headerClasses}`}
    >
      <div className="container mx-auto px-4 py-2 md:py-4">
        <div className="flex items-center justify-between gap-2 md:flex-row md:items-center md:gap-3">
          <div className="hidden items-center gap-2 md:flex md:gap-3">
            <Link to="/" className="flex items-center gap-2" aria-label="FixieStore">
              <img
                src="/bulat.png"
                alt="Ikon FixieStore"
                className="h-8 w-8 rounded-full bg-muted/20 dark:invert md:h-10 md:w-10"
              />
              <h1 className="text-lg font-bold md:text-2xl">FixieStore</h1>
            </Link>
          </div>

          {!hideSearchControls && (
            <div className="flex flex-1 items-center md:hidden">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Cari produk..."
                  className="pl-9"
                />
              </div>
             </div>
          )}

          {!hideSearchControls && (
            <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
              <div className="flex w-full items-center gap-2 md:w-2/5 lg:w-[40%]">
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Cari produk atau brand"
                    className="pl-9"
                  />

                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-40 mt-2 w-full rounded-xl border bg-background p-3 shadow-lg">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Saran Teratas
                      </p>
                      <div className="grid gap-3">
                        <div className="space-y-2">
                          {filteredSuggestions.slice(0, 3).map((product) => (
                            <button
                              key={`suggestion-${product.id}`}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-muted"
                              onMouseDown={() => {
                                onSearchChange(product.name);
                                handleSearchSubmit(product.name);
                              }}
                            >
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-1 items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold leading-tight">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                                </div>
                                <span className="text-xs text-primary">{formatCurrency(product.price)}</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {filteredSuggestions.slice(3).map((product) => (
                            <button
                              key={`suggestion-card-${product.id}`}
                              className="group flex items-center gap-2 rounded-lg border bg-card px-2 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                              onMouseDown={() => {
                                onSearchChange(product.name);
                                handleSearchSubmit(product.name);
                              }}
                            >
                              {product.imageUrl && (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              )}
                              <div className="space-y-0.5">
                                <p className="text-sm font-semibold leading-tight line-clamp-1">
                                  {product.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                  {product.brand || "Produk"}
                                </p>
                                <p className="text-xs font-semibold text-primary">{formatCurrency(product.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
          )}

          <div className="flex items-center justify-end gap-0.5 md:gap-2">
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

            <Button
              variant="ghost"
              size="icon"
              aria-label="Kembali ke beranda"
              onClick={handleHomeClick}
              className="hidden md:inline-flex"
            >
              <Home className="h-5 w-5" />
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
                <div className="flex items-center gap-1 md:hidden">
                  <Button variant="ghost" size="icon" aria-label="Masuk" asChild>
                    <Link to="/login">
                      <LogIn className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="icon" aria-label="Daftar" asChild>
                    <Link to="/register">
                      <UserPlus className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <Button variant="outline" asChild size="sm">
                    <Link to="/login">Masuk</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Daftar</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
