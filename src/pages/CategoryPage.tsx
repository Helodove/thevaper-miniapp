import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getProducts, getCategories } from '@/api/catalog';
import { BrandHeader } from '@/components/BrandHeader';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { STALE } from '@/lib/queryClient';
import { sortByStock } from '@/lib/sortByStock';

export function CategoryPage() {
  const { categoryId } = useParams<{ storeId: string; categoryId: string }>();
  const [inStock, setInStock] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', categoryId],
    queryFn: () => getProducts({ categoryId }),
    staleTime: STALE.products,
    enabled: !!categoryId,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: STALE.categories,
  });

  const categoryTitle = categories?.find((c) => c.id === categoryId)?.title ?? 'Каталог';

  const sorted = useMemo(() => {
    const items = data?.items ?? [];
    const filtered = inStock ? items.filter((p) => p.inStock) : items;
    return sortByStock(filtered);
  }, [data, inStock]);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <BrandHeader />

      <div className="px-4 py-4" style={{ background: 'var(--brand-primary)' }}>
        <h1 className="text-[22px] font-extrabold text-white tracking-tight">{categoryTitle}</h1>
      </div>

      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => setInStock((v) => !v)}
          className="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold"
          style={inStock ? { background: 'var(--brand-primary)', color: 'white' } : { background: 'var(--border-soft)', color: 'var(--text-secondary)' }}
        >
          В наличии
        </button>
      </div>

      <div className="px-4 pb-8">
        {isError && <ErrorState />}
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : sorted.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
        {!isLoading && sorted.length === 0 && (
          <p className="text-center py-12 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            Товаров не найдено
          </p>
        )}
      </div>
    </div>
  );
}
