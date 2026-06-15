'use client';

interface VariantRow {
  name: string;
  sku: string;
  priceOverride: string;
  stockQuantity: string;
}

interface Props {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
}

export function VariantList({ variants, onChange }: Props) {
  function add() {
    onChange([...variants, { name: '', sku: '', priceOverride: '', stockQuantity: '0' }]);
  }

  function remove(i: number) {
    onChange(variants.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: keyof VariantRow, value: string) {
    onChange(variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  return (
    <div className="space-y-3">
      {variants.map((v, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              required
              value={v.name}
              onChange={e => update(i, 'name', e.target.value)}
              placeholder="e.g. Large / Red"
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">SKU</label>
            <input
              required
              value={v.sku}
              onChange={e => update(i, 'sku', e.target.value)}
              placeholder="PROD-001-L"
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Price override ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={v.priceOverride}
              onChange={e => update(i, 'priceOverride', e.target.value)}
              placeholder="Leave blank = base price"
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Stock</label>
              <input
                type="number"
                min="0"
                required
                value={v.stockQuantity}
                onChange={e => update(i, 'stockQuantity', e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="self-end rounded border border-red-200 px-2 py-1.5 text-sm text-red-500 hover:bg-red-50"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-indigo-600 hover:underline"
      >
        + Add variant
      </button>
    </div>
  );
}
