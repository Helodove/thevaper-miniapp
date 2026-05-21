import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/format';
import { haptic } from '@/lib/telegram';
import type { Product } from '@/api/types';
import { useNavigate } from 'react-router-dom';

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { items, add, increment, decrement } = useCartStore();
  const cartItem = items.find((i) => i.productId === product.id);
  const qty = cartItem?.quantity ?? 0;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    haptic('light');
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  }

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="cursor-pointer overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Фото */}
      <div className="relative aspect-square overflow-hidden bg-[--border-soft]">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--border-soft)' }}
          >
            <img src="/logo-thevaper-original.png" alt="" className="w-12 h-12 rounded-lg opacity-30" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/30 flex items-end justify-start p-2">
            <span className="text-[11px] font-semibold text-white bg-black/50 rounded-md px-2 py-0.5">
              Нет в наличии
            </span>
          </div>
        )}
      </div>

      {/* Инфо */}
      <div className="p-3 relative">
        <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </p>
        {product.flavor && (
          <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
            {product.flavor}
          </p>
        )}
        <div className="flex items-end justify-between mt-2">
          <p className="text-[16px] font-extrabold price" style={{ color: 'var(--brand-primary)' }}>
            {formatPrice(product.price)}
          </p>
          {product.inStock && (
            <div onClick={(e) => e.stopPropagation()}>
              {qty === 0 ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAdd}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  <Plus size={16} strokeWidth={2.5} color="white" />
                </motion.button>
              ) : (
                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); haptic('light'); decrement(product.id); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--border-soft)' }}
                  >
                    <Minus size={13} strokeWidth={2.5} style={{ color: 'var(--brand-primary)' }} />
                  </motion.button>
                  <span className="text-[14px] font-bold w-5 text-center" style={{ color: 'var(--text-primary)' }}>
                    {qty}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); haptic('light'); increment(product.id); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--brand-primary)' }}
                  >
                    <Plus size={13} strokeWidth={2.5} color="white" />
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
