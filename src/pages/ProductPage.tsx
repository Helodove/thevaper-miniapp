import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, MessageCircle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct, getStock } from '@/api/catalog';
import { getShops } from '@/api/shops';
import { formatPrice } from '@/lib/format';
import { haptic, openLink } from '@/lib/telegram';
import { useCartStore } from '@/store/cart';
import { useShopStore } from '@/store/shop';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Skeleton } from '@/components/ui/Skeleton';
import { queryClient, STALE } from '@/lib/queryClient';
import type { Shop, Product, ProductVariant, ProductsResponse } from '@/api/types';

const BOT_USERNAME = 'TVcatalogbot';

// ─── StockShopRow ─────────────────────────────────────────────────────────────
function StockShopRow({
  shop,
  quantity,
  isSelected,
  onSelect,
}: {
  shop: Shop;
  quantity: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const inStock = quantity > 0;

  function handleMapTap(e: React.MouseEvent) {
    e.stopPropagation();
    haptic('light');
    openLink(`https://yandex.ru/maps/?text=${encodeURIComponent(shop.city + ' ' + shop.address)}`);
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => { haptic('light'); onSelect(); }}
      className="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer"
      style={{
        background: isSelected ? 'color-mix(in srgb, var(--brand-primary) 8%, var(--bg-card))' : 'var(--bg-card)',
        boxShadow: 'var(--shadow-card)',
        border: isSelected ? '1.5px solid var(--brand-primary)' : '1.5px solid transparent',
        opacity: inStock ? 1 : 0.5,
      }}
    >
      <div className="flex-1 min-w-0 mr-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[15px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {shop.address}
          </p>
          {isSelected && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--brand-primary)', color: 'var(--text-on-brand, white)' }}
            >
              Ваш магазин
            </span>
          )}
        </div>
        <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {shop.hours} · {shop.schedule}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-[12px] font-bold"
          style={{ color: inStock ? 'var(--brand-primary)' : 'var(--text-secondary)' }}
        >
          {inStock ? `В наличии · ${quantity}` : 'Нет'}
        </span>
        <button
          onClick={handleMapTap}
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: 'var(--border-soft)' }}
        >
          <MapPin size={13} strokeWidth={2} style={{ color: 'var(--brand-primary)' }} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── StockBlock ───────────────────────────────────────────────────────────────
function StockBlock({
  stockId,
  selectedShopId,
  onSelectShop,
}: {
  stockId: string;
  selectedShopId?: string;
  onSelectShop: (shop: Shop) => void;
}) {
  const { data: stockItems, isLoading: stockLoading, isError: stockError } = useQuery({
    queryKey: ['stock', stockId],
    queryFn: () => getStock(stockId),
    staleTime: STALE.stock,
  });
  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: getShops,
    staleTime: STALE.shops,
  });

  if (stockLoading || shopsLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  // Ошибка API — данные недоступны
  if (stockError) {
    return (
      <div
        className="rounded-2xl p-4 text-center space-y-3"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          Уточните наличие у менеджера — детальная информация по складам временно недоступна.
        </p>
        <button
          onClick={() => { haptic('light'); openLink(`https://t.me/${BOT_USERNAME}`); }}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl font-semibold text-[14px] text-white"
          style={{ background: 'var(--brand-primary)' }}
        >
          <MessageCircle size={16} />
          Написать в Telegram
        </button>
      </div>
    );
  }

  const allShops = shops ?? [];
  const stockMap = new Map((stockItems ?? []).map((s) => [s.shopId, s.quantity]));
  const hasAnyStock = [...stockMap.values()].some((q) => q > 0);

  // API вернул данные, но везде 0 — товар закончился
  if (!hasAnyStock) {
    return (
      <div
        className="rounded-2xl p-4 text-center space-y-3"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          Сейчас нет в наличии. Свяжитесь с нами, чтобы узнать о поступлении.
        </p>
        <button
          onClick={() => { haptic('light'); openLink(`https://t.me/${BOT_USERNAME}`); }}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl font-semibold text-[14px] text-white"
          style={{ background: 'var(--brand-primary)' }}
        >
          <MessageCircle size={16} />
          Написать в Telegram
        </button>
      </div>
    );
  }

  const byCity = allShops.reduce<Record<string, { shop: Shop; quantity: number }[]>>((acc, shop) => {
    const qty = stockMap.get(shop.id) ?? 0;
    (acc[shop.city] ??= []).push({ shop, quantity: qty });
    return acc;
  }, {});

  Object.values(byCity).forEach((arr) =>
    arr.sort((a, b) => {
      if (a.shop.id === selectedShopId) return -1;
      if (b.shop.id === selectedShopId) return 1;
      return (b.quantity > 0 ? 1 : 0) - (a.quantity > 0 ? 1 : 0);
    })
  );

  return (
    <div className="space-y-4">
      {Object.entries(byCity).map(([city, items]) => (
        <div key={city}>
          <p
            className="text-[12px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {city}
          </p>
          <div className="space-y-2">
            {items.map(({ shop, quantity }) => (
              <StockShopRow
                key={shop.id}
                shop={shop}
                quantity={quantity}
                isSelected={shop.id === selectedShopId}
                onSelect={() => onSelectShop(shop)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VariantChip — один цвет с предзагрузкой остатков ────────────────────────
function VariantChip({
  variant,
  isSelected,
  selectedShopId,
  onSelect,
}: {
  variant: ProductVariant;
  isSelected: boolean;
  selectedShopId?: string;
  onSelect: (id: string) => void;
}) {
  const { data: stockItems } = useQuery({
    queryKey: ['stock', variant.id],
    queryFn: () => getStock(variant.id),
    staleTime: STALE.stock,
  });

  // Проверяем наличие: если магазин выбран — смотрим конкретно в нём
  const inStock = stockItems
    ? selectedShopId
      ? stockItems.some((s) => s.shopId === selectedShopId && s.quantity > 0)
      : stockItems.some((s) => s.quantity > 0)
    : null; // null = ещё загружается

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={() => { haptic('light'); onSelect(variant.id); }}
      className="px-4 py-2 rounded-2xl text-[13px] font-semibold transition-all relative"
      style={
        isSelected
          ? { background: 'var(--brand-primary)', color: 'white', boxShadow: '0 2px 12px rgba(31,191,173,0.35)' }
          : inStock === true
          ? { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)', border: '2px solid var(--brand-primary)' }
          : inStock === false
          ? { background: 'var(--bg-card)', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-card)', border: '1.5px solid var(--border-soft)', opacity: 0.45 }
          : { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)', border: '1.5px solid var(--border-soft)' }
      }
    >
      {variant.color}
    </motion.button>
  );
}

// ─── VariantPicker ────────────────────────────────────────────────────────────
function VariantPicker({
  variants,
  selected,
  selectedShopId,
  onSelect,
}: {
  variants: ProductVariant[];
  selected: string | null;
  selectedShopId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-5">
      <p className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
        Выберите цвет
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <VariantChip
            key={v.id}
            variant={v}
            isSelected={v.id === selected}
            selectedShopId={selectedShopId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ProductPage ──────────────────────────────────────────────────────────────
export function ProductPage() {
  const { productId } = useParams<{ storeId: string; productId: string }>();
  const { items, add, increment, decrement } = useCartStore();
  const { selectedShop, setShop } = useShopStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId!),
    staleTime: STALE.products,
    enabled: !!productId,
    initialData: (): Product | undefined => {
      const listCaches = queryClient.getQueriesData<ProductsResponse>({ queryKey: ['products'] });
      for (const [, data] of listCaches) {
        const found = data?.items?.find((p) => p.id === productId);
        if (found) return found;
      }
      return undefined;
    },
    // initialData из кеша не имеет вариантов — помечаем как устаревшую чтобы сразу дозагрузить
    initialDataUpdatedAt: 0,
  });

  const hasVariants = (product?.variants?.length ?? 0) > 0;
  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId);

  // Для варианта в корзине: если выбран цвет — добавляем вариант, иначе — родительский товар
  const cartId = selectedVariantId ?? productId!;
  const cartItem = items.find((i) => i.productId === cartId);
  const qty = cartItem?.quantity ?? 0;

  // stockId: если выбран вариант — запрашиваем по нему, иначе — по родительскому товару
  const stockId = selectedVariantId ?? productId!;

  const { data: stockItems } = useQuery({
    queryKey: ['stock', stockId],
    queryFn: () => getStock(stockId),
    staleTime: STALE.stock,
    enabled: !!stockId && !!selectedShop,
  });

  const maxQty = selectedShop && stockItems
    ? (stockItems.find((s) => s.shopId === selectedShop.id)?.quantity)
    : undefined;

  function handleAdd() {
    if (!product) return;
    haptic('medium');
    const name = selectedVariant ? `${product.name} (${selectedVariant.color})` : product.name;
    const image = selectedVariant?.image || product.images[0];
    add({ productId: cartId, name, price: product.price, image });
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="w-full aspect-square rounded-[24px]" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4 px-8 text-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <p className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>
          Не удалось загрузить товар
        </p>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          Попробуйте вернуться назад и открыть снова
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Фото */}
      {(() => {
        const displayImage = selectedVariant?.image || product.images[0] || null;
        return (
          <div className="w-full aspect-square relative overflow-hidden" style={{ background: 'var(--brand-gradient)' }}>
            <AnimatePresence mode="wait">
              {displayImage ? (
                <motion.img
                  key={displayImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  src={displayImage}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain p-6"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.onerror = null;
                    t.src = '/logo-thevaper-original.png';
                    t.style.padding = '0';
                    t.className = 'absolute inset-0 w-24 h-24 rounded-2xl opacity-60 m-auto';
                  }}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img src="/logo-thevaper-original.png" alt="" className="w-24 h-24 rounded-2xl opacity-60" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* Контент */}
      <div className="px-4 pt-5">
        {product.brand && (
          <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            {product.brand}
          </p>
        )}
        <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h1>

        {product.flavor && !hasVariants && (
          <span
            className="inline-block mt-2 px-3 py-1 rounded-full text-[13px] font-semibold"
            style={{ background: 'var(--border-soft)', color: 'var(--brand-primary)' }}
          >
            {product.flavor}
          </span>
        )}

        {product.puffs && (
          <p className="mt-3 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            {product.puffs.toLocaleString()} затяжек
          </p>
        )}

        {product.description && (
          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {product.description}
          </p>
        )}

        {/* Выбор цвета */}
        {hasVariants && (
          <VariantPicker
            variants={product.variants!}
            selected={selectedVariantId}
            selectedShopId={selectedShop?.id}
            onSelect={setSelectedVariantId}
          />
        )}

        {/* Блок наличия */}
        <div className="mt-8">
          <h2 className="text-[18px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            В наличии в магазинах
          </h2>

          {hasVariants && !selectedVariantId ? (
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
            >
              <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                Выберите цвет выше, чтобы увидеть наличие по магазинам
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={stockId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <StockBlock
                  stockId={stockId}
                  selectedShopId={selectedShop?.id}
                  onSelectShop={setShop}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <p className="mt-6 text-[11px] text-center" style={{ color: 'var(--text-secondary)' }}>
          18+. Продажа лицам младше 18 лет запрещена.
        </p>
      </div>

      {/* Sticky bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3 safe-bottom"
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-soft)',
          boxShadow: '0 -8px 24px -8px rgba(31,191,173,0.12)',
        }}
      >
        <div className="flex-1">
          {product.oldPrice && (
            <p className="text-[12px] line-through" style={{ color: 'var(--text-secondary)' }}>
              {formatPrice(product.oldPrice)}
            </p>
          )}
          <p className="text-[22px] font-extrabold price" style={{ color: 'var(--brand-primary)' }}>
            {formatPrice(product.price)}
          </p>
        </div>

        {hasVariants && !selectedVariantId ? (
          <div
            className="px-6 h-[56px] rounded-2xl flex items-center font-bold text-[14px]"
            style={{ background: 'var(--border-soft)', color: 'var(--text-secondary)' }}
          >
            Выберите цвет
          </div>
        ) : qty === 0 ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 h-[56px] rounded-2xl font-bold text-[15px] text-white"
            style={{ background: 'var(--brand-primary)' }}
          >
            <ShoppingBag size={20} strokeWidth={1.75} />
            В корзину
          </motion.button>
        ) : (
          <QuantityStepper
            quantity={qty}
            max={maxQty}
            onIncrement={() => { haptic('light'); increment(cartId); }}
            onDecrement={() => { haptic('light'); decrement(cartId); }}
          />
        )}
      </div>
    </div>
  );
}
