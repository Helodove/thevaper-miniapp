import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getShops } from '@/api/shops';
import { useShopStore } from '@/store/shop';
import { ShopCard } from '@/components/ShopCard';
import { SearchInput } from '@/components/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { haptic } from '@/lib/telegram';
import { STALE } from '@/lib/queryClient';
import type { Shop } from '@/api/types';

export function StoreSelectPage() {
  const navigate = useNavigate();
  const { setShop } = useShopStore();
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = useCallback((v: string) => {
    setSearchVal(v);
    if (v.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(v)}`);
    }
  }, [navigate]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shops'],
    queryFn: getShops,
    staleTime: STALE.shops,
  });

  const byCity = (data ?? []).reduce<Record<string, Shop[]>>((acc, shop) => {
    (acc[shop.city] ??= []).push(shop);
    return acc;
  }, {});

  function handleSelect(shop: Shop) {
    haptic('light');
    setShop(shop);
    navigate(`/store/${shop.id}`);
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Шапка */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <img src="/logo-thevaper-original.png" alt="TheVaper" className="w-10 h-10 rounded-xl" />
          <span className="text-[22px] font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            TheVaper
          </span>
        </div>
        <p className="text-[16px] font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
          Выберите магазин
        </p>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Мы покажем товары и наличие для выбранной точки
        </p>
        <div className="mt-4">
          <SearchInput value={searchVal} onChange={handleSearch} placeholder="Найти товар, вкус или бренд" />
        </div>
      </div>

      <div className="px-4 pb-8 space-y-6">
        {isError && <ErrorState />}

        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52" />
            ))}
          </div>
        )}

        {Object.entries(byCity).map(([city, shops], ci) => (
          <section key={city}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{city}</h2>
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
                  <ShopCard shop={shop} onSelect={() => handleSelect(shop)} />
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
