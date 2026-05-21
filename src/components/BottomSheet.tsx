import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function BottomSheet({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] overflow-hidden safe-bottom"
            style={{ background: 'var(--bg-card)', maxHeight: '80vh' }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              {title && (
                <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full"
                style={{ background: 'var(--border-soft)' }}
              >
                <X size={16} strokeWidth={2} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 72px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
