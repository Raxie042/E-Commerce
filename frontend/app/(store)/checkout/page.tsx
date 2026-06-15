'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { CheckoutForm } from './CheckoutForm';
import type { CheckoutResponse } from './types';
import Link from 'next/link';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
);

interface AddressForm {
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState<AddressForm>({
    line1: '', line2: '', city: '', region: '', postalCode: '', country: 'US',
  });
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Please sign in to checkout.</p>
        <Link href="/login" className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white">
          Sign in
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white">
          Browse products
        </Link>
      </div>
    );
  }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = await api.post<CheckoutResponse>('/api/orders/checkout', {
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
        country: address.country,
      });
      setCheckoutData(data);
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function field(
    label: string,
    key: keyof AddressForm,
    required = true,
    placeholder = ''
  ) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          value={address[key]}
          onChange={e => setAddress(prev => ({ ...prev, [key]: e.target.value }))}
          required={required}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Left — form */}
        <div className="md:col-span-3">
          {step === 'address' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Shipping address</h2>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                {field('Address line 1', 'line1', true, '123 Main St')}
                {field('Address line 2', 'line2', false, 'Apt 4B')}
                <div className="grid grid-cols-2 gap-3">
                  {field('City', 'city', true, 'New York')}
                  {field('State / Region', 'region', true, 'NY')}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {field('Postal code', 'postalCode', true, '10001')}
                  {field('Country', 'country', true, 'US')}
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60"
                >
                  {submitting ? 'Confirming…' : 'Continue to payment'}
                </button>
              </form>
            </div>
          )}

          {step === 'payment' && checkoutData && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Payment</h2>
              <Elements
                stripe={stripePromise}
                options={{ clientSecret: checkoutData.clientSecret, appearance: { theme: 'stripe' } }}
              >
                <CheckoutForm orderId={checkoutData.orderId} />
              </Elements>
              <button
                onClick={() => setStep('address')}
                className="mt-3 text-sm text-gray-400 hover:text-indigo-600"
              >
                ← Back to address
              </button>
            </div>
          )}
        </div>

        {/* Right — summary */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Order summary</h3>
            <ul className="space-y-3 mb-4">
              {cart.items.map(item => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <span className="flex-1 text-gray-700 leading-snug">
                    {item.productTitle} — {item.variantName}
                    <span className="text-gray-400"> ×{item.quantity}</span>
                  </span>
                  <span className="font-medium shrink-0">${item.subtotal.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
