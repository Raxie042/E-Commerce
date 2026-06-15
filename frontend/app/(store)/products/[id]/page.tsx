import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { VariantSelector } from './VariantSelector';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API}/api/products/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load product');
  return res.json();
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/products" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
        ← Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.title}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth={0.8} viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 16M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide mb-1">
            {product.categoryName ?? 'Uncategorized'}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.title}</h1>
          <p className="text-sm text-gray-400 mb-4">Sold by <span className="font-medium text-gray-600">{product.storeName}</span></p>

          <VariantSelector variants={product.variants} basePrice={product.basePrice} />

          {product.description && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
