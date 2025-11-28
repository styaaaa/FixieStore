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
  imageUrl: string;
  description: string;
  categoryId: string | null;
  createdAt: string | null;
}
