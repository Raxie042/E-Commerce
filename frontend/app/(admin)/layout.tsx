'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col p-4 gap-1 shrink-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Admin</p>
        <NavLink href="/admin/dashboard">Dashboard</NavLink>
        <NavLink href="/admin/users">Users</NavLink>
        <NavLink href="/admin/orders">Orders</NavLink>
        <div className="mt-auto">
          <Link href="/" className="block text-sm text-slate-400 hover:text-white py-2">
            ← Storefront
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
    >
      {children}
    </Link>
  );
}
