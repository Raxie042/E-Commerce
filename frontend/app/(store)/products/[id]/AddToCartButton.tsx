'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

interface Props {
  variantId: string;
  stock: number;
}

export function AddToCartButton({ variantId, stock }: Props) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick() {
    if (!user) { router.push('/login'); return; }
    if (stock === 0) return;
    setLoading(true);
    try {
      await addItem(variantId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not add to cart');
    } finally {
      setLoading(false);
    }
  }

  if (stock === 0) {
    return (
      <button disabled
        className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-medium cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-medium transition-colors ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
      } disabled:opacity-60`}
    >
      {loading ? 'Adding…' : added ? 'Added!' : 'Add to Cart'}
    </button>
  );
}
