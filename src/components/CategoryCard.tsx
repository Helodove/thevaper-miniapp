import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { haptic } from '@/lib/telegram';
import { getCategoryCover } from '@/lib/categoryCovers';
import { useShopStore } from '@/store/shop';
import type { Category } from '@/api/types';

export function CategoryCard({ category }: { category: Category }) {
  const navigate = useNavigate();
  const { selectedShop } = useShopStore();
  const cover = category.cover || getCategoryCover(category.title);

  function handleTap() {
    haptic('light');
    if (selectedShop) {
      navigate(`/store/${selectedShop.id}/category/${category.id}`);
    }
  }

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={handleTap}
      className="relative aspect-square overflow-hidden cursor-pointer"
      style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <img
        src={cover}
        alt={category.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }}
      />
      <p className="absolute bottom-0 left-0 right-0 text-white text-[16px] font-extrabold leading-tight px-3 pb-3">
        {category.title}
      </p>
    </motion.div>
  );
}
