export interface CartItem {
  id: string;
  productVariantId: string;
  productId: string;
  productTitle: string;
  variantName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  sellerId: string;
  storeName: string;
  stockQuantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}
