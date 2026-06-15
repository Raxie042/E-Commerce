'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { VariantList } from './VariantList';
import type { Category, Product, ProductStatus } from '@/types/product';

interface VariantRow {
  name: string;
  sku: string;
  priceOverride: string;
  stockQuantity: string;
}

interface Props {
  product?: Product;
}

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [basePrice, setBasePrice] = useState(product?.basePrice.toString() ?? '');
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'Draft');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map(v => ({
      name: v.name,
      sku: v.sku,
      priceOverride: v.priceOverride?.toString() ?? '',
      stockQuantity: v.stockQuantity.toString(),
    })) ?? [{ name: 'Default', sku: '', priceOverride: '', stockQuantity: '0' }]
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Category[]>('/api/categories').then(setCategories).catch(() => {});
  }, []);

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload('/api/uploads/image', file);
      setImageUrl(url);
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = {
        title,
        description,
        basePrice: parseFloat(basePrice),
        categoryId: categoryId || undefined,
        imageUrl: imageUrl || undefined,
        status,
        variants: variants.map(v => ({
          name: v.name,
          sku: v.sku,
          priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : undefined,
          stockQuantity: parseInt(v.stockQuantity),
        })),
      };

      if (isEdit) {
        await api.put(`/api/products/${product.id}`, body);
      } else {
        await api.post('/api/products', body);
      }

      router.push('/seller/products');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  function flatCategories(cats: Category[], depth = 0): { id: string; label: string }[] {
    return cats.flatMap(c => [
      { id: c.id, label: `${'  '.repeat(depth)}${c.name}` },
      ...flatCategories(c.children, depth + 1),
    ]);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Basic info</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input required value={title} onChange={e => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base price (£)</label>
            <input required type="number" min="0.01" step="0.01" value={basePrice}
              onChange={e => setBasePrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">None</option>
              {flatCategories(categories).map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as ProductStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Image</h2>
        {imageUrl && (
          <img src={imageUrl} alt="Product" className="w-32 h-32 rounded-lg object-cover bg-gray-100" />
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          {uploading ? 'Uploading…' : imageUrl ? 'Change image' : 'Upload image'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Variants</h2>
        <p className="text-xs text-gray-400">At least one variant is required. Variant SKUs must be unique.</p>
        <VariantList variants={variants} onChange={setVariants} />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
