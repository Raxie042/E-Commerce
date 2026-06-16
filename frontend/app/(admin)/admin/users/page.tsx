'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PagedResult } from '@/types/product';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  storeName?: string;
  payoutEnabled?: boolean;
}

const ROLES = ['Buyer', 'Seller', 'Admin'];
const ROLE_COLOR: Record<string, string> = {
  Admin: 'bg-red-100 text-red-700',
  Seller: 'bg-purple-100 text-purple-700',
  Buyer: 'bg-gray-100 text-gray-600',
};

export default function AdminUsersPage() {
  const [result, setResult] = useState<PagedResult<AdminUser> | null>(null);
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (filterRole) params.set('role', filterRole);
    const data = await api.get<PagedResult<AdminUser>>(`/api/admin/users?${params}`);
    setResult(data);
  }, [page, filterRole]);

  useEffect(() => { load(); }, [load]);

  async function changeRole(userId: string, newRole: string) {
    setUpdating(userId);
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setResult(prev => prev
        ? { ...prev, items: prev.items.map(u => u.id === userId ? { ...u, role: newRole } : u) }
        : prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update role.');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <div className="flex gap-2">
          {['', ...ROLES].map(r => (
            <button key={r}
              onClick={() => { setFilterRole(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterRole === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}>
              {r || 'All'}
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
                {['Name', 'Email', 'Role', 'Store', 'Joined', 'Change Role'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.items.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{u.storeName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={u.role}
                      disabled={updating === u.id}
                      onChange={e => changeRole(u.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
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
