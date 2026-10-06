import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { haptic, getColorScheme } from '@/lib/telegram';
import { getCategoryTileStyle, getCategoryTitle } from '@/lib/categoryCovers';
import { useShopStore } from '@/store/shop';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { Category } from '@/api/types';

export function CategoryCard({ category }: { category: Category }) {
  const navigate = useNavigate();
  const { selectedShop } = useShopStore();
  const displayTitle = getCategoryTitle(category.title);

  function handleTap() {
    haptic('light');
    if (selectedShop) {
      navigate(`/store/${selectedShop.id}/category/${category.id}`);
    }
  }

  // Своя обложка из API (если задана) — показываем фото, как раньше
  if (category.cover) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={handleTap}
        className="relative aspect-square overflow-hidden cursor-pointer"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <img src={category.cover} alt={category.title} className="w-full h-full object-cover" loading="lazy" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }}
        />
        <p className="absolute bottom-0 left-0 right-0 text-white text-[16px] font-extrabold leading-tight px-3 pb-3">
          {displayTitle}
        </p>
      </motion.div>
    );
  }

  // Цветная плитка: свой цвет категории + иконка из набора
  const tile = getCategoryTileStyle(category.title);
  const dark = getColorScheme() === 'dark';

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={handleTap}
      className="relative aspect-square overflow-hidden cursor-pointer p-3.5"
      style={{
        borderRadius: 'var(--radius-card)',
        background: dark ? tile.tintDark : tile.tint,
        color: dark ? tile.inkDark : tile.ink,
      }}
    >
      <p className="relative z-[1] text-[15px] font-extrabold leading-tight max-w-[80%]">
        {displayTitle}
      </p>
      <CategoryIcon
        name={tile.icon}
        strokeWidth={1.5}
        className="absolute right-3 bottom-3 w-[56%] h-[56%]"
      />
    </motion.div>
  );
}
