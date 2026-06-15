import Link from 'next/link';
import type { Category, PagedResult, Product } from '@/types/product';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function fetchProducts(search?: string, categoryId?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), pageSize: '20' });
  if (search) params.set('search', search);
  if (categoryId) params.set('categoryId', categoryId);
  const res = await fetch(`${API}/api/products?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json() as Promise<PagedResult<Product>>;
}

async function fetchCategories() {
  const res = await fetch(`${API}/api/categories`, { next: { revalidate: 300 } });
  if (!res.ok) return [] as Category[];
  return res.json() as Promise<Category[]>;
}

interface Props {
  searchParams: Promise<{ search?: string; categoryId?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const [result, categories] = await Promise.all([
    fetchProducts(sp.search, sp.categoryId, page),
    fetchCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/products"
                className={`block text-sm px-2 py-1 rounded hover:bg-gray-100 ${!sp.categoryId ? 'font-medium text-indigo-600' : 'text-gray-600'}`}
              >
                All
              </Link>
            </li>
            {categories.map(c => (
              <li key={c.id}>
                <Link
                  href={`/products?categoryId=${c.id}${sp.search ? `&search=${sp.search}` : ''}`}
                  className={`block text-sm px-2 py-1 rounded hover:bg-gray-100 ${sp.categoryId === c.id ? 'font-medium text-indigo-600' : 'text-gray-600'}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {result.totalCount} {result.totalCount === 1 ? 'product' : 'products'}
              {sp.search && <> for &ldquo;{sp.search}&rdquo;</>}
            </p>
          </div>

          {result.items.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {result.items.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(n => (
                <Link
                  key={n}
                  href={`/products?${new URLSearchParams({
                    ...(sp.search ? { search: sp.search } : {}),
                    ...(sp.categoryId ? { categoryId: sp.categoryId } : {}),
                    page: String(n),
                  })}`}
                  className={`px-3 py-1 rounded text-sm border ${n === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {n}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  const lowestPrice = p.variants.length
    ? Math.min(...p.variants.map(v => v.priceOverride ?? p.basePrice))
    : p.basePrice;

  return (
    <Link href={`/products/${p.id}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 16M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-gray-400">{p.storeName}</p>
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{p.title}</p>
        <p className="text-sm font-bold text-indigo-600 mt-auto">${lowestPrice.toFixed(2)}</p>
      </div>
    </Link>
  );
}
