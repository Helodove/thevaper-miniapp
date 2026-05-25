import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryClientProvider } from '@tanstack/react-query';
import { initTelegram, getColorScheme, tg } from '@/lib/telegram';
import { queryClient } from '@/lib/queryClient';
import { StoreSelectPage } from '@/pages/StoreSelectPage';
import { StoreHomePage } from '@/pages/StoreHomePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { SearchPage } from '@/pages/SearchPage';
import { AdminPage } from '@/pages/AdminPage';
import { TopLoadingBar } from '@/components/TopLoadingBar';

function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  const app = tg();
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'var(--bg-base)' }}>
      <img src="/logo-thevaper-original.png" alt="TheVaper" className="w-20 h-20 rounded-2xl mb-6" />
      <h1 className="text-[28px] font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
        Добро пожаловать
      </h1>
      <p className="text-[15px] mb-8" style={{ color: 'var(--text-secondary)' }}>
        Этот магазин продаёт товары для совершеннолетних
      </p>
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onConfirm}
          className="flex-1 h-12 rounded-2xl font-bold text-white text-[15px]"
          style={{ background: 'var(--brand-primary)' }}
        >
          Мне 18+
        </button>
        <button
          onClick={() => app?.close()}
          className="flex-1 h-12 rounded-2xl font-semibold text-[15px]"
          style={{ background: 'var(--border-soft)', color: 'var(--text-secondary)' }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

function BackButtonSync() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const app = tg();
    if (!app) return;

    if (location.pathname === '/') {
      app.BackButton.hide();
      return;
    }

    app.BackButton.show();
    const handler = () => {
      // Если история пуста — идём на главную, иначе назад
      if ((window.history.state?.idx ?? 0) > 0) {
        navigate(-1);
      } else {
        navigate('/');
      }
    };
    app.BackButton.onClick(handler);
    return () => app.BackButton.offClick(handler);
  // navigate и tg() — стабильные ссылки, достаточно pathname
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
}

export default function App() {
  const location = useLocation();
  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    return localStorage.getItem('thevaper-age') === '1';
  });

  useEffect(() => {
    initTelegram();
    const scheme = getColorScheme();
    document.documentElement.classList.toggle('dark', scheme === 'dark');
  }, []);

  function confirmAge() {
    localStorage.setItem('thevaper-age', '1');
    setAgeConfirmed(true);
  }

  const isAdmin = location.pathname === '/admin';

  return (
    <QueryClientProvider client={queryClient}>
      <TopLoadingBar />
      {!ageConfirmed && !isAdmin && <AgeGate onConfirm={confirmAge} />}
      <BackButtonSync />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          <Routes location={location}>
            <Route path="/" element={<StoreSelectPage />} />
            <Route path="/store/:storeId" element={<StoreHomePage />} />
            <Route path="/store/:storeId/category/:categoryId" element={<CategoryPage />} />
            <Route path="/store/:storeId/product/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </QueryClientProvider>
  );
}
