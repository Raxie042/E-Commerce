'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  totalPayouts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/api/admin/stats').then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="py-20 text-center text-gray-400">Loading…</div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), color: 'bg-blue-50 text-blue-700' },
    { label: 'Sellers', value: stats.totalSellers.toLocaleString(), color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Paid Orders', value: stats.paidOrders.toLocaleString(), color: 'bg-green-50 text-green-700' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Total Payouts', value: `$${stats.totalPayouts.toFixed(2)}`, color: 'bg-indigo-50 text-indigo-700' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl p-5 ${c.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500">
          Platform fee retained:{' '}
          <span className="font-bold text-gray-900">
            ${(stats.totalRevenue - stats.totalPayouts).toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}
