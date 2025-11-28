export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  longDescription: string;
  categoryId: string | null;
  createdAt: string | null;
}
