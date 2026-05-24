import { useIsFetching } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

export function TopLoadingBar() {
  const isFetching = useIsFetching();

  return (
    <AnimatePresence>
      {isFetching > 0 && (
        <motion.div
          key="bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 z-[9999] overflow-hidden"
          style={{ height: 3, background: 'var(--border-soft)' }}
        >
          <motion.div
            className="absolute top-0 bottom-0"
            style={{
              width: '45%',
              background: 'linear-gradient(90deg, transparent, var(--brand-primary), var(--brand-accent), var(--brand-primary), transparent)',
              borderRadius: '0 2px 2px 0',
            }}
            animate={{ left: ['-45%', '110%'] }}
            transition={{
              duration: 1.1,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 0.15,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
