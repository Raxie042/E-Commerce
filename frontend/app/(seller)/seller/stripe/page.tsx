'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface StripeStatus {
  connected: boolean;
  payoutEnabled: boolean;
  accountId?: string;
}

export default function SellerStripePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    api.get<StripeStatus>('/api/seller/stripe/status')
      .then(setStripeStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function startOnboarding() {
    setOnboarding(true);
    try {
      const data = await api.get<{ url: string }>('/api/seller/stripe/onboard');
      window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start onboarding.');
      setOnboarding(false);
    }
  }

  if (loading) return <div className="py-20 text-center text-gray-400">Loading…</div>;

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Stripe Connect</h1>
      <p className="text-sm text-gray-500 mb-8">
        Connect your Stripe account to receive payouts when buyers purchase your products.
      </p>

      {status === 'success' && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm">
          Onboarding complete! Your account is being reviewed.
        </div>
      )}
      {status === 'refresh' && (
        <div className="mb-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-700 text-sm">
          Onboarding was not completed. Please try again.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Account connected</span>
          <StatusBadge value={stripeStatus?.connected ?? false} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Payouts enabled</span>
          <StatusBadge value={stripeStatus?.payoutEnabled ?? false} />
        </div>

        {stripeStatus?.accountId && (
          <p className="text-xs text-gray-400 font-mono">{stripeStatus.accountId}</p>
        )}

        <button
          onClick={startOnboarding}
          disabled={onboarding}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60 transition-colors"
        >
          {onboarding
            ? 'Redirecting…'
            : stripeStatus?.connected
              ? 'Update Stripe account'
              : 'Connect with Stripe'}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: boolean }) {
  return value
    ? <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Yes</span>
    : <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">No</span>;
}
