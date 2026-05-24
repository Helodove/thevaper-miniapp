import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Trash2, MapPin, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShops } from '@/api/shops';
import { getStock } from '@/api/catalog';
import { useCartStore } from '@/store/cart';
import { useShopStore } from '@/store/shop';
import { formatPrice } from '@/lib/format';
import { haptic, showMainButton, hideMainButton, sendOrder } from '@/lib/telegram';
import { BrandHeader } from '@/components/BrandHeader';
import { QuantityStepper } from '@/components/QuantityStepper';
import { BottomSheet } from '@/components/BottomSheet';
import { EmptyCart } from '@/components/ui/EmptyState';
import { STALE } from '@/lib/queryClient';
import type { Shop } from '@/api/types';

export function CartPage() {
  const navigate = useNavigate();
  const { items, increment, decrement, remove, total, count } = useCartStore();
  const { selectedShop, setShop } = useShopStore();
  const [shopOpen, setShopOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Проверяем наличие каждого товара в выбранном магазине
  const stockQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['stock', item.productId],
      queryFn: () => getStock(item.productId),
      staleTime: STALE.stock,
      enabled: !!selectedShop,
    })),
  });

  // productId → true/false/null (null = загружается или магазин не выбран)
  const stockStatus = new Map<string, boolean | null>();
  items.forEach((item, i) => {
    if (!selectedShop) { stockStatus.set(item.productId, null); return; }
    const q = stockQueries[i];
    if (q.isLoading || !q.data) { stockStatus.set(item.productId, null); return; }
    const shopStock = q.data.find((s) => s.shopId === selectedShop.id);
    stockStatus.set(item.productId, (shopStock?.quantity ?? 0) > 0);
  });

  const unavailableCount = [...stockStatus.values()].filter((v) => v === false).length;

  const shopsQuery = useQuery({ queryKey: ['shops'], queryFn: getShops, staleTime: STALE.shops });
  const byCity = (shopsQuery.data ?? []).reduce<Record<string, Shop[]>>((acc, s) => {
    (acc[s.city] ??= []).push(s);
    return acc;
  }, {});

  const canOrder = items.length > 0 && !!selectedShop && name.trim().length >= 2 && phone.trim().length >= 10;
  const mainBtnText = `Оформить заказ • ${formatPrice(total())}`;

  const handleOrder = useCallback(() => {
    if (!canOrder) return;
    haptic('success');
    sendOrder({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shopId: selectedShop!.id,
      customer: { name, phone },
    });
  }, [canOrder, items, selectedShop, name, phone]);

  useEffect(() => {
    if (items.length > 0) {
      showMainButton(mainBtnText, handleOrder, canOrder);
    } else {
      hideMainButton(handleOrder);
    }
    return () => hideMainButton(handleOrder);
  }, [items.length, mainBtnText, handleOrder, canOrder]);

  if (items.length === 0) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <BrandHeader />
        <EmptyCart />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>
      <BrandHeader />

      <div className="px-4 pt-5 space-y-4 pb-8">
        <h1 className="text-[22px] font-extrabold" style={{ color: 'var(--text-primary)' }}>
          Корзина
        </h1>

        {/* Товары */}
        <AnimatePresence>
          {items.map((item) => {
            const avail = stockStatus.get(item.productId);
            const unavailable = avail === false;
            return (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{
                  background: 'var(--bg-card)',
                  boxShadow: unavailable
                    ? '0 2px 16px rgba(0,0,0,0.4), inset 0 0 0 1.5px rgba(239,68,68,0.5)'
                    : 'var(--shadow-card)',
                }}
              >
                {item.image && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover"
                      style={{ opacity: unavailable ? 0.4 : 1 }}
                    />
                    {unavailable && (
                      <div
                        className="absolute inset-0 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.15)' }}
                      >
                        <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-semibold truncate"
                    style={{ color: unavailable ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                  >
                    {item.name}
                  </p>
                  {unavailable ? (
                    <p className="text-[12px] font-semibold mt-0.5" style={{ color: '#ef4444' }}>
                      Нет в этом магазине
                    </p>
                  ) : (
                    <p className="text-[16px] font-extrabold price mt-0.5" style={{ color: 'var(--brand-primary)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <QuantityStepper
                    quantity={item.quantity}
                    onIncrement={() => increment(item.productId)}
                    onDecrement={() => decrement(item.productId)}
                  />
                  <button
                    onClick={() => { haptic('light'); remove(item.productId); }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl"
                    style={{ background: 'var(--border-soft)' }}
                  >
                    <Trash2 size={14} strokeWidth={2} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Где забрать */}
        <button
          onClick={() => setShopOpen(true)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
          style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--border-soft)' }}
          >
            <MapPin size={20} strokeWidth={1.75} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>Где забрать</p>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {selectedShop ? `${selectedShop.city}, ${selectedShop.address}` : 'Выбрать магазин'}
            </p>
          </div>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--brand-primary)' }}>
            {selectedShop ? 'Изменить' : 'Выбрать'}
          </span>
        </button>

        {/* Имя и телефон */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border-soft)',
            }}
          />
          <input
            type="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border-soft)',
            }}
          />
        </div>

        {/* Итог */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex justify-between text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            <span>Позиций</span>
            <span>{count()}</span>
          </div>
          <div className="flex justify-between text-[18px] font-extrabold">
            <span style={{ color: 'var(--text-primary)' }}>Итого</span>
            <span className="price" style={{ color: 'var(--brand-primary)' }}>{formatPrice(total())}</span>
          </div>
        </div>

        {unavailableCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <p className="text-[13px]" style={{ color: '#f87171' }}>
              {unavailableCount === 1
                ? '1 товар отсутствует в выбранном магазине. Смените магазин или уберите его из корзины.'
                : `${unavailableCount} товара отсутствуют в выбранном магазине. Смените магазин или уберите их из корзины.`}
            </p>
          </motion.div>
        )}

        <p className="text-[11px] text-center" style={{ color: 'var(--text-secondary)' }}>
          18+. Продажа лицам младше 18 лет запрещена.
        </p>
      </div>

      {/* Выбор магазина */}
      <BottomSheet open={shopOpen} onClose={() => setShopOpen(false)} title="Выберите магазин">
        <div className="px-4 pb-6 space-y-4">
          {Object.entries(byCity).map(([city, shops]) => (
            <div key={city}>
              <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                {city}
              </p>
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => { setShop(shop); setShopOpen(false); haptic('light'); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2 text-left"
                  style={{
                    background: selectedShop?.id === shop.id ? 'var(--border-soft)' : 'transparent',
                    border: `1.5px solid ${selectedShop?.id === shop.id ? 'var(--brand-primary)' : 'var(--border-soft)'}`,
                  }}
                >
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{shop.address}</p>
                    <p className="text-[12px] font-medium" style={{ color: 'var(--brand-primary)' }}>{shop.hours}</p>
                  </div>
                  {selectedShop?.id === shop.id && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-primary)' }}>
                      <svg width="10" height="8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
