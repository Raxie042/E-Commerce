'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PagedResult } from '@/types/product';

interface AdminOrder {
  id: string;
  buyerEmail: string;
  buyerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  subOrderCount: number;
  paymentIntentId?: string;
  paymentStatus?: string;
}

const STATUS_COLOR: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  PartiallyFulfilled: 'bg-blue-100 text-blue-700',
  Fulfilled: 'bg-indigo-100 text-indigo-700',
  Cancelled: 'bg-gray-100 text-gray-500',
  Refunded: 'bg-red-100 text-red-600',
};

const ORDER_STATUSES = ['', 'Pending', 'Paid', 'PartiallyFulfilled', 'Fulfilled', 'Cancelled', 'Refunded'];

export default function AdminOrdersPage() {
  const [result, setResult] = useState<PagedResult<AdminOrder> | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (filterStatus) params.set('status', filterStatus);
    const data = await api.get<PagedResult<AdminOrder>>(`/api/admin/orders?${params}`);
    setResult(data);
  }, [page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function refundOrder(orderId: string) {
    if (!confirm('Refund this order? This cannot be undone.')) return;
    setRefunding(orderId);
    try {
      await api.post(`/api/admin/orders/${orderId}/refund`, {});
      setResult(prev => prev
        ? { ...prev, items: prev.items.map(o => o.id === orderId ? { ...o, status: 'Refunded' } : o) }
        : prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Refund failed.');
    } finally {
      setRefunding(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <div className="flex gap-2 flex-wrap">
          {ORDER_STATUSES.map(s => (
            <button key={s}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {!result ? (
        <div className="py-20 text-center text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Buyer', 'Status', 'Amount', 'SubOrders', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.items.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id.split('-')[0]}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{o.buyerName}</p>
                    <p className="text-gray-400 text-xs">{o.buyerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">${o.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{o.subOrderCount}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {o.status === 'Paid' || o.status === 'Fulfilled' || o.status === 'PartiallyFulfilled' ? (
                      <button
                        onClick={() => refundOrder(o.id)}
                        disabled={refunding === o.id}
                        className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                      >
                        {refunding === o.id ? 'Refunding…' : 'Refund'}
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`px-3 py-1 rounded text-sm border ${
                    n === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
