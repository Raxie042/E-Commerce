'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { api } from '@/lib/api';
import { ProductForm } from '@/components/seller/ProductForm';
import type { Product } from '@/types/product';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Product>(`/api/products/${id}`)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>;
  if (!product) return <p className="text-red-500 text-sm">Product not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit product</h1>
      <ProductForm product={product} />
    </div>
  );
}
