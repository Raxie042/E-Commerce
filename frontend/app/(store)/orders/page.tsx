'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get<Order[]>('/api/orders')
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <Link href="/login" className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) return <div className="max-w-3xl mx-auto py-20 text-center text-gray-400">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          No orders yet.{' '}
          <Link href="/products" className="text-indigo-600 hover:underline">Browse products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <Link key={o.id} href={`/orders/${o.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-gray-400 mb-1">{o.id.split('-')[0]}</p>
                <p className="text-sm text-gray-600">
                  {o.subOrders.reduce((acc, so) => acc + so.items.length, 0)} item(s) from{' '}
                  {o.subOrders.map(so => so.storeName).join(', ')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(o.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900">£{o.totalAmount.toFixed(2)}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {o.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
