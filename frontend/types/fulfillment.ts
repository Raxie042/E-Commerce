import type { ShippingAddress } from './order';

export interface SellerOrderItem {
  id: string;
  productTitle: string;
  variantName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Buyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SellerSubOrder {
  id: string;
  orderId: string;
  status: string;
  subtotal: number;
  platformFee: number;
  sellerPayout: number;
  stripeTransferId?: string;
  createdAt: string;
  buyer: Buyer;
  shippingAddress?: ShippingAddress;
  items: SellerOrderItem[];
}

export type SubOrderStatus =
  | 'AwaitingFulfillment'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export const NEXT_STATUS: Partial<Record<SubOrderStatus, SubOrderStatus>> = {
  AwaitingFulfillment: 'Shipped',
  Shipped: 'Delivered',
};

export const STATUS_LABEL: Record<SubOrderStatus, string> = {
  AwaitingFulfillment: 'Awaiting Fulfillment',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  Refunded: 'Refunded',
};

export const STATUS_COLOR: Record<SubOrderStatus, string> = {
  AwaitingFulfillment: 'bg-yellow-100 text-yellow-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-600',
};
