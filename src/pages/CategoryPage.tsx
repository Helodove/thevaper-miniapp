import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getProducts, getCategories, getSubcategories } from '@/api/catalog';
import { BrandHeader } from '@/components/BrandHeader';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { STALE } from '@/lib/queryClient';
import { sortByStock } from '@/lib/sortByStock';
import { useShopStore } from '@/store/shop';
import { getCategoryTitle } from '@/lib/categoryCovers';
import { haptic } from '@/lib/telegram';

// ─── Карточка подкатегории/бренда ─────────────────────────────────────────────
function SubcategoryCard({ title, onTap }: { title: string; onTap: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      className="relative aspect-square overflow-hidden cursor-pointer flex flex-col justify-end"
      style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', background: 'var(--bg-card)' }}
    >
      {/* Большая буква-фон */}
      <span
        className="absolute inset-0 flex items-center justify-center text-[88px] font-extrabold select-none pointer-events-none"
        style={{ color: 'var(--brand-primary)', opacity: 0.07 }}
      >
        {title[0]?.toUpperCase()}
      </span>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--brand-primary) 20%, transparent) 0%, transparent 60%)' }}
      />
      <p
        className="relative z-10 text-[15px] font-extrabold leading-tight px-3 pb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </p>
    </motion.div>
  );
}

// ─── CategoryPage ─────────────────────────────────────────────────────────────
export function CategoryPage() {
  const { storeId, categoryId } = useParams<{ storeId: string; categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [inStock, setInStock] = useState(true);
  const { selectedShop } = useShopStore();

  // Заголовок из корневых категорий (для первого уровня)
  const { data: rootCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: STALE.categories,
  });
  const rootTitle = rootCategories?.find((c) => c.id === categoryId)?.title;

  // Подпапки (подкатегории) из МойСклад
  const { data: subcategories, isLoading: subLoading } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => getSubcategories(categoryId!),
    staleTime: STALE.categories,
    retry: 1,
    enabled: !!categoryId,
  });

  const hasSubcategories = (subcategories?.length ?? 0) > 0;

  // Название: корневая категория → из списка; подкатегория → из state навигации
  const stateTitle: string | undefined = (location.state as any)?.title;
  const displayTitle = rootTitle
    ? getCategoryTitle(rootTitle)
    : stateTitle ?? '...';

  // Для карточек товаров убираем название линейки из имени (если мы в подкатегории)
  function getShortName(productName: string): string {
    if (!stateTitle) return productName;
    // Убираем категорийный префикс
    const clean = productName.replace(/^(Ароматизатор|Испаритель|Картридж|Жидкость)\s+/i, '');
    const titleLower = stateTitle.toLowerCase();
    const cleanLower = clean.toLowerCase();
    // Ищем название линейки в любом месте строки (не только в начале)
    // "OGGO CHERRY Вишня" с title="Cherry" → "Вишня"
    const idx = cleanLower.indexOf(titleLower);
    if (idx !== -1) {
      const end = idx + stateTitle.length;
      // Убеждаемся что совпадение на границе слова
      if (end >= clean.length || clean[end] === ' ') {
        const after = clean.slice(end).trim();
        return after || clean;
      }
    }
    return clean;
  }

  // Товары (загружаем только если нет подкатегорий)
  const storeId_ = inStock ? (selectedShop?.id ?? '') : '';
  const { data, isLoading: productsLoading, isError } = useQuery({
    queryKey: ['products', categoryId, storeId_],
    queryFn: () => getProducts({ categoryId, storeId: storeId_ || undefined }),
    staleTime: STALE.products,
    enabled: !!categoryId && !subLoading && !hasSubcategories,
  });

  const sorted = sortByStock(
    inStock ? (data?.items ?? []).filter((p) => p.inStock) : (data?.items ?? [])
  );

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <BrandHeader />

      <div className="px-4 py-4" style={{ background: 'var(--brand-primary)' }}>
        <h1 className="text-[22px] font-extrabold text-white tracking-tight">{displayTitle}</h1>
      </div>

      {/* Режим подкатегорий */}
      {(subLoading || hasSubcategories) && (
        <div className="px-4 pt-4 pb-8">
          {subLoading && (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            </div>
          )}
          {!subLoading && hasSubcategories && (
            <div className="grid grid-cols-2 gap-3">
              {subcategories!.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SubcategoryCard
                    title={sub.title}
                    onTap={() => {
                      haptic('light');
                      navigate(`/store/${storeId}/category/${sub.id}`, { state: { title: sub.title } });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Режим товаров */}
      {!subLoading && !hasSubcategories && (
        <>
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              onClick={() => setInStock((v) => !v)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold"
              style={inStock
                ? { background: 'var(--brand-primary)', color: 'white' }
                : { background: 'var(--border-soft)', color: 'var(--text-secondary)' }}
            >
              В наличии
            </button>
          </div>
          <div className="px-4 pb-8">
            {isError && <ErrorState />}
            <div className="grid grid-cols-2 gap-3">
              {productsLoading
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : sorted.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    >
                      <ProductCard product={product} displayName={getShortName(product.name)} />
                    </motion.div>
                  ))}
            </div>
            {!productsLoading && sorted.length === 0 && (
              <p className="text-center py-12 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                Товаров не найдено
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
