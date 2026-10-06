import { useState } from 'react';
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
import { getCategoryTitle, getCategoryTileStyle, type CategoryTileStyle } from '@/lib/categoryCovers';
import { haptic, getColorScheme } from '@/lib/telegram';
import { CategoryIcon } from '@/components/CategoryIcon';

// Плитка подкатегории (бренда) в цвете родительской категории — в стиле плиток главной.
function SubcategoryCard({ title, tile, dark, onTap }: {
  title: string;
  tile: CategoryTileStyle;
  dark: boolean;
  onTap: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      onClick={onTap}
      className="relative overflow-hidden cursor-pointer p-3.5"
      style={{
        borderRadius: 'var(--radius-card)',
        background: dark ? tile.tintDark : tile.tint,
        color: dark ? tile.inkDark : tile.ink,
        aspectRatio: '1.45',
      }}
    >
      <p className="relative z-[1] text-[15px] font-extrabold leading-tight max-w-[85%] break-words">{title}</p>
      <CategoryIcon
        name={tile.icon}
        strokeWidth={1.5}
        className="absolute -right-2 -bottom-3 w-[46%] h-[70%] opacity-30"
      />
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
  // Цвет и иконка — от корневой категории; в подкатегорию она передаётся через state
  const styleTitle: string = rootTitle ?? (location.state as any)?.rootTitle ?? stateTitle ?? '';
  const tile = getCategoryTileStyle(styleTitle);
  const dark = getColorScheme() === 'dark';
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

      <div
        className="px-4 py-4 flex items-center justify-between gap-3"
        style={{ background: dark ? tile.tintDark : tile.tint, color: dark ? tile.inkDark : tile.ink }}
      >
        <h1 className="text-[22px] font-extrabold tracking-tight leading-tight">{displayTitle}</h1>
        <CategoryIcon name={tile.icon} strokeWidth={1.6} className="flex-shrink-0 w-11 h-11" />
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
                    tile={tile}
                    dark={dark}
                    onTap={() => {
                      haptic('light');
                      navigate(`/store/${storeId}/category/${sub.id}`, { state: { title: sub.title, rootTitle: styleTitle } });
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
                      <ProductCard product={product} displayName={getShortName(product.name)} tile={tile} />
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
