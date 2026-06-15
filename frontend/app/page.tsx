'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading…</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold text-gray-900">Marketplace</h1>

      {user ? (
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            Welcome, <span className="font-medium">{user.firstName}</span>{' '}
            <span className="text-xs text-gray-400">({user.role})</span>
          </p>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Create account
          </Link>
        </div>
      )}
    </main>
  );
}
