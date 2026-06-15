'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  productId: string;
}

export function ReviewForm({ productId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!user) return (
    <p className="text-sm text-gray-400">
      <a href="/login" className="text-indigo-600 hover:underline">Sign in</a> to leave a review.
    </p>
  );

  if (done) return (
    <p className="text-sm text-green-600 font-medium">Review submitted — thank you!</p>
  );

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/api/products/${productId}/reviews`, { rating, body });
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-xl ${n <= rating ? 'text-yellow-400' : 'text-gray-200'} hover:text-yellow-400 transition-colors`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          required
          rows={3}
          placeholder="Share your experience…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !body.trim()}
        className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
