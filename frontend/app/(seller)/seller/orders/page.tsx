'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { PagedResult } from '@/types/product';
import type { SellerSubOrder, SubOrderStatus } from '@/types/fulfillment';
import { STATUS_COLOR, STATUS_LABEL } from '@/types/fulfillment';

const STATUSES: (SubOrderStatus | '')[] = [
  '', 'AwaitingFulfillment', 'Shipped', 'Delivered', 'Cancelled', 'Refunded',
];

export default function SellerOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const [result, setResult] = useState<PagedResult<SellerSubOrder> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (status) params.set('status', status);
      const data = await api.get<PagedResult<SellerSubOrder>>(`/api/seller/suborders?${params}`);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  function setFilter(newStatus: string) {
    const params = new URLSearchParams();
    if (newStatus) params.set('status', newStatus);
    router.push(`/seller/orders?${params}`);
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              status === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}
          >
            {s ? (STATUS_LABEL[s as SubOrderStatus] ?? s) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading…</div>
      ) : !result || result.items.length === 0 ? (
        <div className="py-20 text-center text-gray-400">No orders found.</div>
      ) : (
        <>
          <div className="space-y-3">
            {result.items.map(so => (
              <Link
                key={so.id}
                href={`/seller/orders/${so.id}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">{so.id.split('-')[0]}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[so.status as SubOrderStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[so.status as SubOrderStatus] ?? so.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {so.buyer.firstName} {so.buyer.lastName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {so.items.length} item(s) · {new Date(so.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">£{so.subtotal.toFixed(2)}</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Payout: £{so.sellerPayout.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (status) params.set('status', status);
                    params.set('page', String(n));
                    router.push(`/seller/orders?${params}`);
                  }}
                  className={`px-3 py-1 rounded text-sm border ${
                    n === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
