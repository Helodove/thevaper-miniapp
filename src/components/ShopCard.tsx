import { motion } from 'framer-motion';
import { openLink } from '@/lib/telegram';
import type { Shop } from '@/api/types';

function ShopPlaceholder() {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{
        aspectRatio: '1.4',
        background: 'linear-gradient(135deg, #1FBFAD 0%, #169E8E 100%)',
      }}
    >
      <img src="/logo-thevaper-original.png" alt="TheVaper" className="w-12 h-12 rounded-xl opacity-90" />
    </div>
  );
}

export function ShopCard({ shop }: { shop: Shop }) {
  function handleTap() {
    openLink(`https://yandex.ru/maps/?text=${encodeURIComponent(shop.city + ' ' + shop.address)}`);
  }

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={handleTap}
      className="overflow-hidden cursor-pointer"
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
      <div className="px-4 py-3 pb-4">
        <p className="text-[14px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {shop.address}
        </p>
        <p className="text-[20px] font-extrabold mt-0.5 price" style={{ color: 'var(--brand-primary)' }}>
          {shop.hours}
        </p>
        <p className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {shop.schedule}
        </p>
      </div>
    </motion.div>
  );
}
