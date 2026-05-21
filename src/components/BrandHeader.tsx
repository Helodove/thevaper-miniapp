import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart';
import { motion } from 'framer-motion';

export function BrandHeader() {
  const navigate = useNavigate();
  const count = useCartStore((s) => s.count());

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-soft)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button onClick={() => navigate('/')} className="flex items-center gap-2 min-h-[44px] min-w-[44px]">
        <img
          src="/logo-thevaper-original.png"
          alt="TheVaper"
          className="rounded-lg object-cover"
          style={{ width: 32, height: 32 }}
        />
        <span className="font-extrabold text-[17px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
          TheVaper
        </span>
      </button>

      <button
        onClick={() => navigate('/cart')}
        className="relative flex items-center justify-center min-w-[44px] min-h-[44px]"
      >
        <ShoppingBag size={24} strokeWidth={1.75} style={{ color: 'var(--brand-primary)' }} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold text-white"
            style={{ background: 'var(--brand-primary)' }}
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </button>
    </header>
  );
}
