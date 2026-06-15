import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Product } from '@/types/product';
import type { ReviewDto } from '@/types/review';
import { VariantSelector } from './VariantSelector';
import { ReviewForm } from './ReviewForm';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API}/api/products/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load product');
  return res.json();
}

async function fetchReviews(id: string): Promise<ReviewDto[]> {
  const res = await fetch(`${API}/api/products/${id}/reviews`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const [product, reviews] = await Promise.all([fetchProduct(id), fetchReviews(id)]);
  if (!product) notFound();

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

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
          <p className="text-sm text-gray-400 mb-1">
            Sold by <span className="font-medium text-gray-600">{product.storeName}</span>
          </p>
          {avgRating !== null && (
            <p className="text-sm text-gray-500 mb-4">
              <span className="text-yellow-400">{'★'.repeat(Math.round(avgRating))}</span>
              <span className="text-gray-300">{'★'.repeat(5 - Math.round(avgRating))}</span>
              {' '}<span className="text-gray-400">{avgRating.toFixed(1)} ({reviews.length})</span>
            </p>
          )}

          <VariantSelector variants={product.variants} basePrice={product.basePrice} />

          {product.description && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review list */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet. Be the first!</p>
            ) : reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{r.buyerName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-yellow-400 text-sm mb-2">
                  {'★'.repeat(r.rating)}<span className="text-gray-200">{'★'.repeat(5 - r.rating)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>

          {/* Review form */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Write a review</h3>
            <ReviewForm productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
