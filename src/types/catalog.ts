export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
}

export type Product = {
  id: string;
  name: string;
  brandId: string | null;   // ✅ WAJIB
  brand?: string;           // opsional (hasil join / display)
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  longDescription: string;
  categoryId: string | null;
  createdAt: string | null;
};
