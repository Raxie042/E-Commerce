import { Suspense } from 'react';
import { Navbar } from '@/components/store/Navbar';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-white border-b" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
    </>
  );
}
