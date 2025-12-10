export interface PurchasedProduct {
  orderId: string;
  productId: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  price: number;
}

export interface ProductReview {
  id: string;
  orderId?: string;
  productId: string;
  rating: number;
  message: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  userId?: string;
}
