import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { openLink } from '@/lib/telegram';
import type { Shop } from '@/api/types';

function ShopPlaceholder() {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ aspectRatio: '1.4', background: 'linear-gradient(135deg, #1FBFAD 0%, #169E8E 100%)' }}
    >
      <img src="/logo-thevaper-original.png" alt="TheVaper" className="w-12 h-12 rounded-xl opacity-90" />
    </div>
  );
}

interface ShopCardProps {
  shop: Shop;
  onSelect?: () => void;
}

export function ShopCard({ shop, onSelect }: ShopCardProps) {
  function handleMapTap(e: React.MouseEvent) {
    e.stopPropagation();
    openLink(`https://yandex.ru/maps/?text=${encodeURIComponent(shop.city + ' ' + shop.address)}`);
  }

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={onSelect ? 'overflow-hidden cursor-pointer' : 'overflow-hidden'}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {shop.cover ? (
        <img src={shop.cover} alt={shop.address} className="w-full object-cover" style={{ aspectRatio: '1.4' }} />
      ) : (
        <ShopPlaceholder />
      )}
      <div className="px-3 py-3 pb-4">
        <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {shop.address}
        </p>
        <p className="text-[18px] font-extrabold mt-0.5 price" style={{ color: 'var(--brand-primary)' }}>
          {shop.hours}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {shop.schedule}
          </p>
          <button
            onClick={handleMapTap}
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: 'var(--border-soft)' }}
          >
            <MapPin size={14} strokeWidth={2} style={{ color: 'var(--brand-primary)' }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
