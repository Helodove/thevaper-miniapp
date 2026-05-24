import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { openLink } from '@/lib/telegram';
import type { Shop } from '@/api/types';

const SHOP_IMAGES: Array<[string, string]> = [
  ['катукова',            '/shops/katukova.png'],
  ['8 марта',             '/shops/8marta.png'],
  ['плеханова',           '/shops/plekhanov.png'],
  ['космонавтов',         '/shops/kosmonavt.png'],
  ['зои космодемьянской', '/shops/zoi.png'],
  ['газина',              '/shops/gazina.png'],
];

function getShopImage(address: string): string {
  const lower = address.toLowerCase();
  for (const [key, src] of SHOP_IMAGES) {
    if (lower.includes(key)) return src;
  }
  return '/shop-building.svg';
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

  const imgSrc = shop.cover || getShopImage(shop.address);

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
      <img
        src={imgSrc}
        alt={shop.address}
        className="w-full object-cover"
        style={{ aspectRatio: '1.4' }}
      />
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
