export interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  stock: string;
  description: string;
  longDescription: string;
  categoryId: string | null;
  file: File | null;
}

export type DashboardView = "monitoring" | "order-status" | "add-product" | "product-table";
