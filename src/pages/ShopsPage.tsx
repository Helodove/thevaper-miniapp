import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getShops } from '@/api/shops';
import { BrandHeader } from '@/components/BrandHeader';
import { ShopCard } from '@/components/ShopCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { STALE } from '@/lib/queryClient';
import type { Shop } from '@/api/types';

export function ShopsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shops'],
    queryFn: getShops,
    staleTime: STALE.shops,
  });

  const byCity = (data ?? []).reduce<Record<string, Shop[]>>((acc, shop) => {
    (acc[shop.city] ??= []).push(shop);
    return acc;
  }, {});

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <BrandHeader />

      <div className="px-4 pt-5 pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <img src="/logo-thevaper-original.png" alt="TheVaper" className="w-8 h-8 rounded-lg" />
          <h1 className="text-[24px] font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            График работы
          </h1>
        </div>

        {isError && <ErrorState />}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        )}

        {Object.entries(byCity).map(([city, shops], ci) => (
          <section key={city}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{city}</h2>
              <div className="flex-1 h-px" style={{ background: 'var(--border-soft)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {shops.map((shop, i) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (ci * shops.length + i) * 0.05 }}
                >
                  <ShopCard shop={shop} />
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
