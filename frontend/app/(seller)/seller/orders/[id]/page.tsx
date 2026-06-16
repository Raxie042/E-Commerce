'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { SellerSubOrder, SubOrderStatus } from '@/types/fulfillment';
import { NEXT_STATUS, STATUS_COLOR, STATUS_LABEL } from '@/types/fulfillment';

export default function SellerSubOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [subOrder, setSubOrder] = useState<SellerSubOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get<SellerSubOrder>(`/api/seller/suborders/${id}`)
      .then(setSubOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function advanceStatus() {
    if (!subOrder) return;
    const next = NEXT_STATUS[subOrder.status as SubOrderStatus];
    if (!next) return;

    setUpdating(true);
    try {
      await api.put(`/api/seller/suborders/${id}/status`, { status: next });
      setSubOrder(prev => prev ? { ...prev, status: next } : prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="py-20 text-center text-gray-400">Loading…</div>;
  if (!subOrder) return <div className="py-20 text-center text-gray-400">Order not found.</div>;

  const currentStatus = subOrder.status as SubOrderStatus;
  const nextStatus = NEXT_STATUS[currentStatus];

  const NEXT_LABEL: Partial<Record<SubOrderStatus, string>> = {
    AwaitingFulfillment: 'Mark as Shipped',
    Shipped: 'Mark as Delivered',
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-indigo-600 mb-6 block">
        ← Back to orders
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Sub-order</h1>
        <span className="font-mono text-xs text-gray-400">{subOrder.id.split('-')[0]}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[currentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[currentStatus] ?? currentStatus}
        </span>

        {nextStatus && (
          <button
            onClick={advanceStatus}
            disabled={updating}
            className="ml-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-medium text-white disabled:opacity-60"
          >
            {updating ? 'Updating…' : NEXT_LABEL[currentStatus]}
          </button>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Items</h2>
        <ul className="divide-y divide-gray-50">
          {subOrder.items.map(item => (
            <li key={item.id} className="py-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.productTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.productTitle}</p>
                <p className="text-xs text-gray-400">{item.variantName} × {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 shrink-0">£{item.subtotal.toFixed(2)}</p>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span><span>£{subOrder.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Platform fee (10%)</span><span>-£{subOrder.platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
            <span>Your payout</span><span className="text-green-600">£{subOrder.sellerPayout.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Buyer */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Buyer</h2>
        <p className="text-sm text-gray-700">{subOrder.buyer.firstName} {subOrder.buyer.lastName}</p>
        <p className="text-sm text-gray-400">{subOrder.buyer.email}</p>
      </div>

      {/* Shipping */}
      {subOrder.shippingAddress && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Ship to</h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>{subOrder.shippingAddress.line1}</p>
            {subOrder.shippingAddress.line2 && <p>{subOrder.shippingAddress.line2}</p>}
            <p>
              {subOrder.shippingAddress.city}, {subOrder.shippingAddress.region}{' '}
              {subOrder.shippingAddress.postalCode}
            </p>
            <p>{subOrder.shippingAddress.country}</p>
          </div>
        </div>
      )}

      {/* Stripe transfer */}
      {subOrder.stripeTransferId && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Stripe transfer</h2>
          <p className="font-mono text-xs text-gray-400">{subOrder.stripeTransferId}</p>
        </div>
      )}
    </div>
  );
}
