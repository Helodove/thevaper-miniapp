import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { getCategories } from '@/api/catalog';
import { getShops } from '@/api/shops';
import { BrandHeader } from '@/components/BrandHeader';
import { CategoryCard } from '@/components/CategoryCard';
import { SearchInput } from '@/components/SearchInput';
import { LatestPostBanner } from '@/components/LatestPostBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { openLink } from '@/lib/telegram';
import { STALE } from '@/lib/queryClient';

export function StoreHomePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const { data: shops } = useQuery({
    queryKey: ['shops'],
    queryFn: getShops,
    staleTime: STALE.shops,
  });

  const { data: categories, isLoading: catsLoading, isError: catsError } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: STALE.categories,
  });

  const shop = shops?.find((s) => s.id === storeId);

  const handleSearch = useCallback((v: string) => {
    setSearchVal(v);
    if (v.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(v)}`);
    }
  }, [navigate]);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <BrandHeader />

      {/* Инфо о магазине */}
      {shop && (
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-soft)' }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {shop.city}, {shop.address}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={11} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
              <p className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {shop.hours} · {shop.schedule}
              </p>
            </div>
          </div>
          <button
            onClick={() => openLink(`https://yandex.ru/maps/?text=${encodeURIComponent(shop.city + ' ' + shop.address)}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold flex-shrink-0"
            style={{ background: 'var(--border-soft)', color: 'var(--brand-primary)' }}
          >
            <MapPin size={12} />
            Карта
          </button>
        </div>
      )}

      <div className="space-y-5 pb-8">
        {/* Баннер */}
        <div className="pt-4">
          <LatestPostBanner />
        </div>

        {/* Поиск */}
        <div className="px-4">
          <SearchInput value={searchVal} onChange={handleSearch} />
        </div>

        {/* Категории */}
        <section className="px-4">
          <h2 className="text-[20px] font-extrabold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Категории
          </h2>
          {catsError && <ErrorState />}
          <div className="grid grid-cols-2 gap-3">
            {catsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))
              : (categories ?? []).map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <CategoryCard category={cat} />
                  </motion.div>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
