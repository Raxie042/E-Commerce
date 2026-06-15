export interface OrderItem {
  id: string;
  productVariantId: string;
  productTitle: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SubOrder {
  id: string;
  sellerId: string;
  storeName: string;
  status: string;
  subtotal: number;
  platformFee: number;
  sellerPayout: number;
  items: OrderItem[];
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress?: ShippingAddress;
  subOrders: SubOrder[];
}
