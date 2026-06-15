'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') ?? '');

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    router.push(`/products?${params}`);
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-indigo-600 shrink-0">
          Marketplace
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </form>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.273M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {!!cart?.itemCount && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                {cart.itemCount > 9 ? '9+' : cart.itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/orders"
                className="text-sm text-gray-600 hover:text-indigo-600">
                Orders
              </Link>
              {user.role === 'Seller' && (
                <Link href="/seller/products"
                  className="text-sm text-gray-600 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <span className="font-medium">{user.firstName}</span>
              </div>
              <button onClick={logout}
                className="text-xs text-gray-400 hover:text-red-500">
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-gray-600 hover:text-indigo-600">Sign in</Link>
              <Link href="/register"
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
