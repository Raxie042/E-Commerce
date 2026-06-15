'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Sign in to view your cart.</p>
        <Link href="/login" className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading cart…
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
        <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600">
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {cart.items.map(item => (
          <div key={item.id}
            className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.productTitle}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl">📦</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.productId}`}
                className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-1">
                {item.productTitle}
              </Link>
              <p className="text-xs text-gray-400 mt-0.5">{item.variantName} · {item.storeName}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">£{item.unitPrice.toFixed(2)}</p>
            </div>

            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeItem(item.id)}
                className="text-xs text-gray-300 hover:text-red-400">
                ✕
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 text-lg leading-none"
                >
                  −
                </button>
                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateItem(item.id, Math.min(item.stockQuantity, item.quantity + 1))}
                  disabled={item.quantity >= item.stockQuantity}
                  className="w-7 h-7 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                >
                  +
                </button>
              </div>
              <p className="text-sm font-bold text-indigo-600">£{item.subtotal.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-medium">£{cart.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-3">
          <span>Total</span>
          <span>£{cart.total.toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block w-full text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
        >
          Proceed to Checkout
        </Link>
        <Link href="/products"
          className="mt-2 block w-full text-center py-2 text-sm text-gray-400 hover:text-indigo-600">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
