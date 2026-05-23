import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { getProducts } from '@/api/catalog';
import { SearchInput } from '@/components/SearchInput';
import { BrandHeader } from '@/components/BrandHeader';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { sortByStock } from '@/lib/sortByStock';
import { useShopStore } from '@/store/shop';
import { haptic } from '@/lib/telegram';
import { STALE } from '@/lib/queryClient';

const HISTORY_KEY = 'thevaper-search-history';
const MAX_HISTORY = 5;

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); } catch { return []; }
}
function saveHistory(q: string) {
  const h = [q, ...getHistory().filter((x) => x !== q)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

export function SearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  const { selectedShop } = useShopStore();
  const [focused, setFocused] = useState(false);
  const history = getHistory();

  // Sync query → URL (не уходим со страницы при очистке)
  useEffect(() => {
    if (query.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
  }, [query]);

  const [inStock, setInStock] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, selectedShop?.id],
    queryFn: () => getProducts({ search: query, storeId: selectedShop?.id }),
    staleTime: STALE.products,
    enabled: query.length >= 2,
  });

  useEffect(() => {
    if (query.length >= 2 && data) saveHistory(query);
  }, [data]);

  const sorted = useMemo(() => {
    const items = data?.items ?? [];
    return sortByStock(inStock ? items.filter((p) => p.inStock) : items);
  }, [data, inStock]);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <BrandHeader />

      <div className="px-4 pt-4 pb-3 space-y-3">
        <div
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        >
          <SearchInput value={query} onChange={setQuery} autoFocus />
        </div>

        {/* История запросов */}
        {focused && query === '' && history.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {history.map((h) => (
              <button
                key={h}
                onClick={() => { haptic('light'); setQuery(h); }}
                className="px-3 py-1.5 rounded-full text-[13px] font-semibold"
                style={{ background: 'var(--border-soft)', color: 'var(--text-secondary)' }}
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Фильтр — только когда выбран магазин */}
      {query.length >= 2 && selectedShop && (
        <div className="px-4 pb-2">
          <button
            onClick={() => { haptic('light'); setInStock((v) => !v); }}
            className="px-4 py-2 rounded-full text-[13px] font-semibold"
            style={inStock
              ? { background: 'var(--brand-primary)', color: 'white' }
              : { background: 'var(--border-soft)', color: 'var(--text-secondary)' }}
          >
            В наличии
          </button>
        </div>
      )}

      {/* Результаты */}
      <div className="px-4 pb-8">
        {query.length >= 2 && (
          <>
            {isLoading && (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            )}

            {!isLoading && sorted.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-4 text-center">
                <SearchX size={64} strokeWidth={1.5} style={{ color: 'var(--brand-primary)', opacity: 0.5 }} />
                <div>
                  <p className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    Ничего не нашлось по запросу «{query}»
                  </p>
                  <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Попробуйте другой вкус или бренд
                  </p>
                </div>
              </div>
            )}

            {!isLoading && sorted.length > 0 && (
              <>
                <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Найдено: {sorted.length}{inStock ? ' в наличии' : ''}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {sorted.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.25) }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {query.length < 2 && query.length > 0 && (
          <p className="text-center py-8 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            Введите минимум 2 символа
          </p>
        )}
      </div>
    </div>
  );
}
