import { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/store/Navbar';
import type { Product, PagedResult } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?pageSize=8&status=Active`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: PagedResult<Product> = await res.json();
    return data.items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-white border-b" />}>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-24 px-4 text-center text-white">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Your Next Favourite Shop
          </h1>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Discover thousands of products from independent UK sellers — all in one place.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-indigo-700 font-semibold px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Shop Now
          </Link>
        </section>

        {/* Featured Products */}
        {products.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
              <Link
                href="/products"
                className="text-indigo-600 hover:underline text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className="group">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl select-none">
                        🛍
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {p.title}
                  </p>
                  <p className="text-sm text-indigo-600 font-semibold mt-0.5">
                    £{p.basePrice.toFixed(2)}
                  </p>
                  {p.storeName && (
                    <p className="text-xs text-gray-400 mt-0.5">{p.storeName}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sell CTA */}
        <section className="bg-gray-50 border-t py-16 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Start Selling Today</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Join our marketplace, connect your Stripe account, and reach customers
            across the UK instantly.
          </p>
          <Link
            href="/register"
            className="inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Become a Seller
          </Link>
        </section>
      </main>
    </>
  );
}
