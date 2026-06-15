'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/types/order';

const STATUS_COLOR: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  PartiallyFulfilled: 'bg-blue-100 text-blue-700',
  Fulfilled: 'bg-indigo-100 text-indigo-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-600',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const paymentStatus = searchParams.get('payment_intent_client_secret')
    ? (searchParams.get('redirect_status') ?? null)
    : null;

  useEffect(() => {
    if (!user) return;
    api.get<Order>(`/api/orders/${id}`)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <Link href="/login" className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) return <div className="max-w-3xl mx-auto py-20 text-center text-gray-400">Loading order…</div>;
  if (!order) return <div className="max-w-3xl mx-auto py-20 text-center text-gray-400">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {paymentStatus === 'succeeded' && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm font-medium">
          Payment successful! Your order has been placed.
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Order</h1>
        <span className="font-mono text-xs text-gray-400">{order.id.split('-')[0]}</span>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-4 mb-8">
        {order.subOrders.map(sub => (
          <div key={sub.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">{sub.storeName}</p>
              <span className="text-xs text-gray-400">{sub.status}</span>
            </div>
            <ul className="divide-y divide-gray-50">
              {sub.items.map(item => (
                <li key={item.id} className="py-2 flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.productTitle} — {item.variantName}
                    <span className="text-gray-400"> ×{item.quantity}</span>
                  </span>
                  <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 mt-3 pt-2 flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${sub.subtotal.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-sm text-gray-600">
          <p className="font-semibold text-gray-900 mb-1">Shipping to</p>
          <p>{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
          <p>{order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}</p>
          <p>{order.shippingAddress.country}</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link href="/products" className="text-sm text-indigo-600 hover:underline">
          Continue shopping
        </Link>
        <Link href="/orders" className="text-sm text-gray-400 hover:text-indigo-600 ml-auto">
          All orders →
        </Link>
      </div>
    </div>
  );
}
