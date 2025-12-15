export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  brandId: string | null;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  longDescription: string;
  categoryId: string | null;
  createdAt: string | null;
}
