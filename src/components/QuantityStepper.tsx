import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { haptic } from '@/lib/telegram';

type Props = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function QuantityStepper({ quantity, onIncrement, onDecrement }: Props) {
  return (
    <motion.div
      layout
      className="flex items-center gap-3"
    >
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => { haptic('light'); onDecrement(); }}
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--border-soft)' }}
      >
        <Minus size={18} strokeWidth={2.5} style={{ color: 'var(--brand-primary)' }} />
      </motion.button>
      <motion.span
        key={quantity}
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        className="text-[20px] font-bold w-8 text-center"
        style={{ color: 'var(--text-primary)' }}
      >
        {quantity}
      </motion.span>
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => { haptic('light'); onIncrement(); }}
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--brand-primary)' }}
      >
        <Plus size={18} strokeWidth={2.5} color="white" />
      </motion.button>
    </motion.div>
  );
}
