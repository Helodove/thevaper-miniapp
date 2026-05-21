import { motion } from 'framer-motion';
import { openLink } from '@/lib/telegram';
import type { Shop } from '@/api/types';

function ShopPlaceholder({ address }: { address: string }) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-2"
      style={{
        aspectRatio: '1.4',
        background: 'linear-gradient(135deg, #1FBFAD 0%, #169E8E 100%)',
      }}
    >
      <img src="/logo-thevaper-original.png" alt="TheVaper" className="w-8 h-8 rounded-md opacity-90" />
      <span className="text-white text-[11px] font-semibold opacity-80 px-2 text-center leading-tight">
        {address}
      </span>
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
        <ShopPlaceholder address={shop.address} />
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
