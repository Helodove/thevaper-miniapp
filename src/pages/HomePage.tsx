import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '@/api/catalog';
import { getShops } from '@/api/shops';
import { BrandHeader } from '@/components/BrandHeader';
import { CategoryCard } from '@/components/CategoryCard';
import { SearchInput } from '@/components/SearchInput';
import { LatestPostBanner } from '@/components/LatestPostBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { STALE } from '@/lib/queryClient';

export function HomePage() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const cats = useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: STALE.categories });
  const shops = useQuery({ queryKey: ['shops'], queryFn: getShops, staleTime: STALE.shops });

  const handleSearch = useCallback((v: string) => {
    setSearchVal(v);
    if (v.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(v)}`);
    }
  }, [navigate]);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <BrandHeader />

      <div className="space-y-5 pb-8">
        <div className="pt-4">
          <LatestPostBanner />
        </div>

        {/* Поиск */}
        <div className="px-4">
          <SearchInput value={searchVal} onChange={handleSearch} />
        </div>

        {/* Категории */}
        <section className="px-4">
          <h2 className="text-[22px] font-extrabold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Категории
          </h2>
          {cats.isError && <ErrorState />}
          <div className="grid grid-cols-2 gap-3">
            {cats.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))
              : (cats.data ?? []).map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <CategoryCard category={cat} />
                  </motion.div>
                ))}
          </div>
        </section>

        {/* Магазины */}
        {(shops.data ?? []).length > 0 && (
          <section className="px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                Наши магазины
              </h2>
              <button
                onClick={() => navigate('/shops')}
                className="flex items-center gap-1 text-[13px] font-semibold"
                style={{ color: 'var(--brand-primary)' }}
              >
                Все <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-0 scrollbar-hide">
              {shops.data?.slice(0, 4).map((shop) => (
                <div
                  key={shop.id}
                  className="flex-shrink-0 w-40 overflow-hidden cursor-pointer"
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 16,
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onClick={() => navigate('/shops')}
                >
                  <div
                    className="w-full flex items-center justify-center"
                    style={{ aspectRatio: '1.4', background: 'var(--brand-gradient)' }}
                  >
                    <img src="/logo-thevaper-original.png" alt="" className="w-8 h-8 rounded-md opacity-90" />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {shop.address}
                    </p>
                    <p className="text-[13px] font-bold mt-0.5 price" style={{ color: 'var(--brand-primary)' }}>
                      {shop.hours}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
