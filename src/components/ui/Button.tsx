import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
};

export function Button({ variant = 'primary', fullWidth, className, children, ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-bold text-[15px] transition-colors min-h-[44px] px-5',
        'rounded-btn select-none',
        variant === 'primary' && 'bg-[--brand-primary] text-white hover:bg-[--brand-primary-dark] active:bg-[--brand-primary-dark]',
        variant === 'secondary' && 'bg-[--border-soft] text-[--text-primary]',
        variant === 'ghost' && 'bg-transparent text-[--brand-primary]',
        fullWidth && 'w-full',
        className
      )}
      {...(props as object)}
    >
      {children}
    </motion.button>
  );
}
