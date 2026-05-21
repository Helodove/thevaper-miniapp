import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const STALE = {
  categories: 60 * 60 * 1000,   // 1 час
  products: 5 * 60 * 1000,       // 5 минут
  stock: 30 * 1000,              // 30 секунд
  shops: 60 * 60 * 1000,         // 1 час
};
