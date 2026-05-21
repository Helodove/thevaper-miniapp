import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProduct } from '@/api/catalog';
import { formatPrice } from '@/lib/format';
import { haptic } from '@/lib/telegram';
import { useCartStore } from '@/store/cart';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Skeleton } from '@/components/ui/Skeleton';
import { STALE } from '@/lib/queryClient';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, add, increment, decrement } = useCartStore();
  const cartItem = items.find((i) => i.productId === id);
  const qty = cartItem?.quantity ?? 0;

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    staleTime: STALE.products,
    enabled: !!id,
  });

  function handleAdd() {
    if (!product) return;
    haptic('medium');
    add({ productId: product.id, name: product.name, price: product.price, image: product.images[0] });
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

  if (!product) return null;

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Фото */}
      <div
        className="w-full aspect-square relative overflow-hidden"
        style={{ background: 'var(--brand-gradient)' }}
      >
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-6" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/logo-thevaper-original.png" alt="" className="w-24 h-24 rounded-2xl opacity-60" />
          </div>
        )}
      </div>

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

        {product.flavor && (
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

        {/* 18+ предупреждение */}
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

        {product.inStock ? (
          qty === 0 ? (
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
              onIncrement={() => { haptic('light'); increment(product.id); }}
              onDecrement={() => { haptic('light'); decrement(product.id); }}
            />
          )
        ) : (
          <span className="text-[14px] font-semibold px-4" style={{ color: 'var(--text-secondary)' }}>
            Нет в наличии
          </span>
        )}
      </div>
    </div>
  );
}
