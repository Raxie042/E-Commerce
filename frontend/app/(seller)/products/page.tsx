'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { PagedResult, Product, ProductStatus } from '@/types/product';

const statusColor: Record<ProductStatus, string> = {
  Draft: 'bg-yellow-100 text-yellow-700',
  Active: 'bg-green-100 text-green-700',
  Archived: 'bg-gray-100 text-gray-500',
};

export default function SellerProductsPage() {
  const [data, setData] = useState<PagedResult<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(page = 1) {
    setLoading(true);
    try {
      const res = await api.get<PagedResult<Product>>(`/api/products/mine?page=${page}&pageSize=20`);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function archive(id: string) {
    if (!confirm('Archive this product? Buyers will no longer see it.')) return;
    await api.delete(`/api/products/${id}`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/seller/products/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New product
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-3">No products yet</p>
          <Link href="/seller/products/new" className="text-indigo-600 text-sm hover:underline">
            Create your first product →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Variants</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.items.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-lg">□</div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{p.title}</p>
                        {p.categoryName && <p className="text-xs text-gray-400">{p.categoryName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">${p.basePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.variants.length}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/seller/products/${p.id}/edit`} className="text-indigo-600 hover:underline">Edit</Link>
                    {p.status !== 'Archived' && (
                      <button onClick={() => archive(p.id)} className="text-red-400 hover:underline">Archive</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className="px-4 py-3 flex gap-2 border-t border-gray-100">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => load(i + 1)}
                  className={`w-8 h-8 rounded text-sm ${data.page === i + 1 ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
