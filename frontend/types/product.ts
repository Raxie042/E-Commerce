export type ProductStatus = 'Draft' | 'Active' | 'Archived';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceOverride?: number;
  stockQuantity: number;
}

export interface Product {
  id: string;
  sellerId: string;
  storeName: string;
  title: string;
  description: string;
  basePrice: number;
  status: ProductStatus;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  variants: ProductVariant[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  children: Category[];
}
