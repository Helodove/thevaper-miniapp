import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Category } from '@/api/types';

export function CategoryCard({ category }: { category: Category }) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/category/${category.id}`)}
      className="relative aspect-square overflow-hidden cursor-pointer"
      style={{ borderRadius: 'var(--radius-card)' }}
    >
      {category.cover ? (
        <img src={category.cover} alt={category.title} className="w-full h-full object-cover" />
      ) : (
        <div style={{ background: 'var(--brand-gradient)' }} className="w-full h-full" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }}
      />
      <p className="absolute bottom-3 left-3 right-3 text-white text-[14px] font-bold leading-tight">
        {category.title}
      </p>
    </motion.div>
  );
}
