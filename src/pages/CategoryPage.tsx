import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getProducts } from '@/api/catalog';
import { BrandHeader } from '@/components/BrandHeader';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { STALE } from '@/lib/queryClient';
import clsx from 'clsx';

const PUFF_FILTERS = [
  { label: 'Все', value: '' },
  { label: '20 000', value: '20000' },
  { label: '12 000', value: '12000' },
];

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [inStock, setInStock] = useState(false);
  const [puffs, setPuffs] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', id, inStock, puffs],
    queryFn: () => getProducts({ categoryId: id, inStock: inStock || undefined }),
    staleTime: STALE.products,
    enabled: !!id,
  });

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <BrandHeader />

      {/* Подложка заголовка */}
      <div className="px-4 py-4" style={{ background: 'var(--brand-primary)' }}>
        <h1 className="text-[22px] font-extrabold text-white tracking-tight">Каталог</h1>
      </div>

      {/* Фильтры */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
        <button
          onClick={() => setInStock((v) => !v)}
          className={clsx(
            'flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors',
            inStock
              ? 'text-white'
              : 'text-[--text-secondary]'
          )}
          style={inStock ? { background: 'var(--brand-primary)' } : { background: 'var(--border-soft)' }}
        >
          В наличии
        </button>
        {PUFF_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setPuffs(f.value)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
            style={puffs === f.value
              ? { background: 'var(--brand-primary)', color: 'white' }
              : { background: 'var(--border-soft)', color: 'var(--text-secondary)' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">
        {isError && <ErrorState />}
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (data?.items ?? []).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
        {!isLoading && data?.items.length === 0 && (
          <p className="text-center py-12 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            Товаров не найдено
          </p>
        )}
      </div>
    </div>
  );
}
