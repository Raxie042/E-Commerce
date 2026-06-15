'use client';

import { useState } from 'react';
import type { ProductVariant } from '@/types/product';
import { AddToCartButton } from './AddToCartButton';

interface Props {
  variants: ProductVariant[];
  basePrice: number;
}

export function VariantSelector({ variants, basePrice }: Props) {
  const [selected, setSelected] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  );

  const price = selected?.priceOverride ?? basePrice;
  const stock = selected?.stockQuantity ?? 0;

  if (variants.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 mb-4">£{basePrice.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mb-4">No variants available.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-2xl font-bold text-gray-900 mb-4">£{price.toFixed(2)}</p>

      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-2">Option</p>
        <div className="flex flex-wrap gap-2">
          {variants.map(v => (
            <button
              key={v.id}
              onClick={() => setSelected(v)}
              disabled={v.stockQuantity === 0}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                selected?.id === v.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : v.stockQuantity === 0
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                    : 'border-gray-200 text-gray-700 hover:border-indigo-300'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="mb-5 text-sm text-gray-500">
          {stock > 0 ? <>{stock} in stock</> : <span className="text-red-500">Out of stock</span>}
        </div>
      )}

      {selected && <AddToCartButton variantId={selected.id} stock={stock} />}
    </div>
  );
}
